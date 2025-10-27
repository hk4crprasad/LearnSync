from datetime import datetime
from bson import ObjectId
import uuid
from app.utils.database import get_chat_sessions_collection
from app.utils.helpers import serialize_doc, serialize_list
from app.utils.ai_client import ai_client
from app.schemas.chatbot import ChatRequest, ChatMessage
from typing import Optional, List


class ChatbotService:
    def __init__(self):
        self.collection = get_chat_sessions_collection()
    
    async def process_chat(self, chat_request: ChatRequest) -> dict:
        """Process chat message and store in database"""
        session_id = chat_request.session_id or str(uuid.uuid4())
        
        # Get existing session if it exists
        existing_session = None
        if chat_request.session_id:
            existing_session = await self.collection.find_one({"session_id": session_id})
        
        # Prepare conversation history
        conversation_history = []
        if existing_session:
            conversation_history = existing_session.get("messages", [])
        
        # Generate AI response
        ai_response = ai_client.generate_response(
            chat_request.message,
            conversation_history=conversation_history
        )
        
        # Prepare messages
        user_message = {
            "role": "user",
            "content": chat_request.message,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        assistant_message = {
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if existing_session:
            # Update existing session
            await self.collection.update_one(
                {"_id": existing_session["_id"]},
                {
                    "$push": {
                        "messages": {
                            "$each": [user_message, assistant_message]
                        }
                    },
                    "$set": {
                        "updated_at": datetime.utcnow().isoformat()
                    }
                }
            )
        else:
            # Create new session
            session_dict = {
                "student_id": chat_request.student_id,
                "session_id": session_id,
                "messages": [user_message, assistant_message],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            await self.collection.insert_one(session_dict)
        
        return {
            "response": ai_response,
            "session_id": session_id,
            "timestamp": assistant_message["timestamp"]
        }
    
    async def get_chat_session(self, session_id: str) -> Optional[dict]:
        """Get chat session by ID"""
        session = await self.collection.find_one({"session_id": session_id})
        return serialize_doc(session) if session else None
    
    def _generate_chat_name(self, first_message: str, max_length: int = 50) -> str:
        """Generate a chat name from the first user message"""
        # Clean and truncate the message
        clean_message = first_message.strip()
        
        # If message is short enough, use it as-is
        if len(clean_message) <= max_length:
            return clean_message
        
        # Truncate and add ellipsis
        return clean_message[:max_length].rsplit(' ', 1)[0] + "..."
    
    async def get_student_sessions(self, student_id: str) -> List[dict]:
        """Get all chat sessions for a student"""
        cursor = self.collection.find({"student_id": student_id}).sort("updated_at", -1)
        sessions = await cursor.to_list(length=None)
        return serialize_list(sessions)
    
    async def get_student_sessions_summary(self, student_id: str) -> List[dict]:
        """Get summary of all chat sessions for a student (without full messages)"""
        cursor = self.collection.find({"student_id": student_id}).sort("updated_at", -1)
        sessions = await cursor.to_list(length=None)
        
        summaries = []
        for session in sessions:
            messages = session.get("messages", [])
            
            # Find first user message
            first_user_message = next(
                (msg["content"] for msg in messages if msg.get("role") == "user"),
                "New Chat"
            )
            
            # Generate chat name from first message
            chat_name = self._generate_chat_name(first_user_message)
            
            # Create preview (first 100 chars of first message)
            preview = first_user_message[:100] + "..." if len(first_user_message) > 100 else first_user_message
            
            summary = {
                "id": str(session["_id"]),
                "session_id": session["session_id"],
                "chat_name": chat_name,
                "message_count": len(messages),
                "created_at": session["created_at"],
                "updated_at": session["updated_at"],
                "preview": preview
            }
            summaries.append(summary)
        
        return summaries
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete chat session"""
        result = await self.collection.delete_one({"session_id": session_id})
        return result.deleted_count > 0


chatbot_service = ChatbotService()
