from fastapi import APIRouter, Form, Request
from fastapi.responses import Response
from twilio.twiml.messaging_response import MessagingResponse
from typing import Dict, List
from app.utils.ai_client import generate_response

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])

# Store conversation history (in production, use Redis or a database)
conversations: Dict[str, List[Dict[str, str]]] = {}

@router.post("/webhook")
async def webhook(
    Body: str = Form(...),
    From: str = Form(...),
    To: str = Form(None),
    MessageSid: str = Form(None)
):
    """Handle incoming WhatsApp messages"""
    
    incoming_msg = Body.strip()
    from_number = From
    
    # Initialize conversation history for new users
    if from_number not in conversations:
        conversations[from_number] = []
    
    # Add user message to history
    conversations[from_number].append({
        "role": "user",
        "content": incoming_msg
    })
    
    # Keep only last 10 messages to manage context
    if len(conversations[from_number]) > 10:
        conversations[from_number] = conversations[from_number][-10:]
    
    try:
        # Get response using the existing AI client
        system_prompt = "You are Edusaathi (ଏଡୁସାଥୀ), a helpful WhatsApp educational assistant. Keep responses concise, friendly, and educational. You can speak in Odia, Hindi, or English based on the user's language."
        
        bot_message = generate_response(
            message=incoming_msg,
            conversation_history=conversations[from_number][:-1],  # Exclude current message
            system_prompt=system_prompt
        )
        
        # Add assistant response to history
        conversations[from_number].append({
            "role": "assistant",
            "content": bot_message
        })
        
    except Exception as e:
        bot_message = f"Sorry, I encountered an error. Please try again later."
        print(f"WhatsApp bot error: {str(e)}")
    
    # Create Twilio response
    resp = MessagingResponse()
    resp.message(bot_message)
    
    return Response(content=str(resp), media_type="application/xml")

@router.get("/status")
async def whatsapp_status():
    """Check WhatsApp bot status"""
    return {
        "status": "running",
        "message": "WhatsApp Chatbot is active",
        "active_conversations": len(conversations)
    }

@router.delete("/conversation/{phone_number}")
async def clear_conversation(phone_number: str):
    """Clear conversation history for a specific number"""
    if phone_number in conversations:
        del conversations[phone_number]
        return {"message": f"Conversation cleared for {phone_number}"}
    return {"message": "No conversation found"}

@router.get("/conversations")
async def get_all_conversations():
    """Get all active conversation count"""
    return {
        "total_conversations": len(conversations),
        "phone_numbers": list(conversations.keys())
    }
