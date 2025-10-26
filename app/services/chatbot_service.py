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
    
    async def get_student_sessions(self, student_id: str) -> List[dict]:
        """Get all chat sessions for a student"""
        cursor = self.collection.find({"student_id": student_id}).sort("updated_at", -1)
        sessions = await cursor.to_list(length=None)
        return serialize_list(sessions)
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete chat session"""
        result = await self.collection.delete_one({"session_id": session_id})
        return result.deleted_count > 0


chatbot_service = ChatbotService()
