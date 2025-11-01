from datetime import datetime
from bson import ObjectId
from app.utils.database import get_messages_collection, get_sessions_collection
from app.schemas.communication import MessageCreate, SessionCreate, SessionUpdate
from app.utils.helpers import serialize_doc, serialize_list
from typing import Optional, List


class CommunicationService:
    def __init__(self):
        self.messages_collection = get_messages_collection()
        self.sessions_collection = get_sessions_collection()
    
    # Message methods
    async def send_message(self, message_data: MessageCreate) -> dict:
        """Send a message"""
        message_dict = message_data.model_dump()
        message_dict["is_read"] = False
        message_dict["created_at"] = datetime.utcnow().isoformat()
        
        result = await self.messages_collection.insert_one(message_dict)
        message_dict["_id"] = result.inserted_id
        
        return serialize_doc(message_dict)
    
    async def get_messages(self, user_id: str, message_type: str = "direct") -> List[dict]:
        """Get messages for a user"""
        cursor = self.messages_collection.find({
            "$or": [
                {"sender_id": user_id},
                {"receiver_id": user_id}
            ],
            "message_type": message_type
        }).sort("created_at", -1)
        
        messages = await cursor.to_list(length=None)
        return serialize_list(messages)
    
    async def mark_as_read(self, message_id: str) -> dict:
        """Mark message as read"""
        result = await self.messages_collection.find_one_and_update(
            {"_id": ObjectId(message_id)},
            {"$set": {"is_read": True}},
            return_document=True
        )
        return serialize_doc(result) if result else None
    
    async def delete_message(self, message_id: str) -> bool:
        """Delete message"""
        result = await self.messages_collection.delete_one({"_id": ObjectId(message_id)})
        return result.deleted_count > 0
    
    # Session methods
    async def create_session(self, session_data: SessionCreate) -> dict:
        """Create a session"""
        session_dict = session_data.model_dump()
        session_dict["created_at"] = datetime.utcnow().isoformat()
        session_dict["updated_at"] = datetime.utcnow().isoformat()
        
        result = await self.sessions_collection.insert_one(session_dict)
        session_dict["_id"] = result.inserted_id
        
        return serialize_doc(session_dict)
    
    async def get_session_by_id(self, session_id: str) -> Optional[dict]:
        """Get session by ID"""
        session = await self.sessions_collection.find_one({"_id": ObjectId(session_id)})
        return serialize_doc(session) if session else None
    
    async def get_sessions_by_course(self, course_id: str) -> List[dict]:
        """Get sessions by course"""
        cursor = self.sessions_collection.find({"course_id": course_id}).sort("scheduled_time", -1)
        sessions = await cursor.to_list(length=None)
        return serialize_list(sessions)
    
    async def get_sessions_by_teacher(self, teacher_id: str) -> List[dict]:
        """Get sessions by teacher"""
        cursor = self.sessions_collection.find({"teacher_id": teacher_id}).sort("scheduled_time", -1)
        sessions = await cursor.to_list(length=None)
        return serialize_list(sessions)
    
    async def update_session(self, session_id: str, session_data: SessionUpdate) -> Optional[dict]:
        """Update session"""
        update_data = {k: v for k, v in session_data.model_dump(exclude_unset=True).items()}
        
        if not update_data:
            return await self.get_session_by_id(session_id)
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = await self.sessions_collection.find_one_and_update(
            {"_id": ObjectId(session_id)},
            {"$set": update_data},
            return_document=True
        )
        
        return serialize_doc(result) if result else None
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete session"""
        result = await self.sessions_collection.delete_one({"_id": ObjectId(session_id)})
        return result.deleted_count > 0


communication_service = CommunicationService()
