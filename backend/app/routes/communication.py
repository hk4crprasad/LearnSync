from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas.communication import Message, MessageCreate, MarkAsRead, Session, SessionCreate, SessionUpdate
from app.services.communication_service import communication_service
from app.middleware.auth import get_current_user, require_teacher

router = APIRouter(prefix="/api/communication", tags=["Communication"])


# Message endpoints
@router.post("/messages", response_model=Message, status_code=201)
async def send_message(
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Send a message"""
    # Ensure sender_id matches current user
    message_data.sender_id = current_user["id"]
    message = await communication_service.send_message(message_data)
    return message


@router.get("/messages", response_model=List[Message])
async def get_messages(
    message_type: str = "direct",
    current_user: dict = Depends(get_current_user)
):
    """Get messages for current user"""
    messages = await communication_service.get_messages(current_user["id"], message_type)
    return messages


@router.post("/messages/{message_id}/read", response_model=Message)
async def mark_message_as_read(
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark message as read"""
    message = await communication_service.mark_as_read(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Check authorization
    if message["receiver_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to mark this message as read")
    
    return message


@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete message"""
    success = await communication_service.delete_message(message_id)
    if not success:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {"message": "Message deleted successfully"}


# Session endpoints
@router.post("/sessions", response_model=Session, status_code=201)
async def create_session(
    session_data: SessionCreate,
    current_user: dict = Depends(require_teacher)
):
    """Create a session (Teacher/Admin only)"""
    session_data.teacher_id = current_user["id"]
    session = await communication_service.create_session(session_data)
    return session


@router.get("/sessions/{session_id}", response_model=Session)
async def get_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get session by ID"""
    session = await communication_service.get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.get("/sessions/course/{course_id}", response_model=List[Session])
async def get_course_sessions(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get sessions for a course"""
    sessions = await communication_service.get_sessions_by_course(course_id)
    return sessions


@router.get("/sessions/teacher/{teacher_id}", response_model=List[Session])
async def get_teacher_sessions(
    teacher_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get sessions by teacher"""
    # Teachers can only view their own sessions unless admin
    if current_user["role"] == "teacher" and teacher_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Cannot view other teachers' sessions")
    
    sessions = await communication_service.get_sessions_by_teacher(teacher_id)
    return sessions


@router.put("/sessions/{session_id}", response_model=Session)
async def update_session(
    session_id: str,
    session_data: SessionUpdate,
    current_user: dict = Depends(require_teacher)
):
    """Update session (Teacher/Admin only)"""
    session = await communication_service.get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session["teacher_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this session")
    
    updated_session = await communication_service.update_session(session_id, session_data)
    return updated_session


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: dict = Depends(require_teacher)
):
    """Delete session (Teacher/Admin only)"""
    session = await communication_service.get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session["teacher_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this session")
    
    success = await communication_service.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session deleted successfully"}
