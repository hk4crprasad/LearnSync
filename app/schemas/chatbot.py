from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class ChatMessage(BaseModel):
    role: str  # user or assistant
    content: str
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None  # Auto-generated if not provided
    student_id: Optional[str] = None  # Will be filled from current user if not provided


class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: str


class ChatSession(BaseModel):
    id: str
    student_id: str
    session_id: str
    messages: List[ChatMessage]
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True


class LearningPathRequest(BaseModel):
    student_id: Optional[str] = None  # Will be filled from current user if not provided
    level: str = "Beginner"
    subjects: List[str]
    weak_areas: List[str] = []
    learning_style: str = "Visual"


class FeedbackRequest(BaseModel):
    question: str
    student_answer: str
    correct_answer: str


class ConceptExplanationRequest(BaseModel):
    concept: str
    difficulty_level: str = "medium"
