from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
import json
from app.schemas.chatbot import (
    ChatRequest, 
    ChatResponse, 
    ChatSession,
    ChatSessionSummary,
    LearningPathRequest,
    FeedbackRequest,
    ConceptExplanationRequest
)
from app.services.chatbot_service import chatbot_service
from app.utils.ai_client import ai_client
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/chatbot", tags=["AI Chatbot"])


@router.post("/ask", response_model=ChatResponse)
async def ask_chatbot(
    chat_request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """Ask the AI chatbot a question (session_id auto-generated for new chats)"""
    # Auto-fill student_id from current user if not provided
    if not chat_request.student_id:
        chat_request.student_id = current_user["id"]
    
    # Verify authorization
    if current_user["role"] == "student" and chat_request.student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Cannot chat as another student")
    
    try:
        response = await chatbot_service.process_chat(chat_request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


@router.post("/ask/stream")
async def ask_chatbot_stream(
    chat_request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """Ask the AI chatbot with streaming response"""
    # Auto-fill student_id from current user if not provided
    if not chat_request.student_id:
        chat_request.student_id = current_user["id"]
    
    # Verify authorization
    if current_user["role"] == "student" and chat_request.student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Cannot chat as another student")
    
    async def generate_stream():
        try:
            # Get chat history for context
            context = await chatbot_service.get_context(chat_request.student_id, chat_request.session_id)
            
            # Create the streaming prompt
            messages = context + [{"role": "user", "content": chat_request.message}]
            
            # Stream from OpenAI
            full_response = ""
            async for chunk in ai_client.stream_chat(messages):
                if chunk:
                    full_response += chunk
                    # Send as JSON for easier parsing in frontend
                    yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
            
            # Save the complete conversation
            session_id = await chatbot_service.save_chat_message(
                student_id=chat_request.student_id,
                session_id=chat_request.session_id,
                user_message=chat_request.message,
                assistant_message=full_response
            )
            
            # Send final message with session_id
            yield f"data: {json.dumps({'chunk': '', 'done': True, 'session_id': session_id})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.get("/sessions/{session_id}", response_model=ChatSession)
async def get_chat_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get chat session by ID"""
    session = await chatbot_service.get_chat_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    # Check authorization
    if current_user["role"] == "student" and session["student_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this session")
    
    return session


@router.get("/sessions/student/{student_id}", response_model=List[ChatSessionSummary])
async def get_student_sessions(
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all chat sessions summary for a student (without full message history)"""
    # Students can only view their own sessions
    if current_user["role"] == "student" and student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Cannot view other students' sessions")
    
    sessions = await chatbot_service.get_student_sessions_summary(student_id)
    return sessions


@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete chat session"""
    session = await chatbot_service.get_chat_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    # Check authorization
    if current_user["role"] == "student" and session["student_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this session")
    
    success = await chatbot_service.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    return {"message": "Chat session deleted successfully"}


@router.post("/learning-path")
async def generate_learning_path(
    request: LearningPathRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate personalized learning path"""
    # Auto-fill student_id from current user if not provided
    if not request.student_id:
        request.student_id = current_user["id"]
    
    # Verify authorization
    if current_user["role"] == "student" and request.student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Cannot generate path for another student")
    
    learning_path = ai_client.generate_learning_path({
        "level": request.level,
        "subjects": request.subjects,
        "weak_areas": request.weak_areas,
        "learning_style": request.learning_style
    })
    
    return {"learning_path": learning_path, "student_id": request.student_id}


@router.post("/feedback")
async def generate_feedback(
    request: FeedbackRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate AI feedback for an answer"""
    feedback = ai_client.generate_feedback(
        request.question,
        request.student_answer,
        request.correct_answer
    )
    
    return {"feedback": feedback}


@router.post("/explain")
async def explain_concept(
    request: ConceptExplanationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Get AI explanation of a concept"""
    explanation = ai_client.explain_concept(
        request.concept,
        request.difficulty_level
    )
    
    return {"concept": request.concept, "explanation": explanation}
