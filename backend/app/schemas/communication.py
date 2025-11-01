from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MessageBase(BaseModel):
    sender_id: str
    receiver_id: str
    subject: str
    content: str
    message_type: str = "direct"  # direct, announcement, reply


class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    id: str
    is_read: bool = False
    created_at: str
    
    class Config:
        from_attributes = True


class MarkAsRead(BaseModel):
    message_id: str


class SessionMetadata(BaseModel):
    title: str
    description: str
    course_id: str
    teacher_id: str
    session_type: str  # live, recorded
    scheduled_time: Optional[str] = None
    duration: Optional[int] = None  # in minutes
    recording_url: Optional[str] = None
    materials: Optional[List[str]] = None


class SessionCreate(SessionMetadata):
    pass


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_time: Optional[str] = None
    duration: Optional[int] = None
    recording_url: Optional[str] = None
    materials: Optional[List[str]] = None


class Session(SessionMetadata):
    id: str
    created_at: str
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True
