from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TopicBase(BaseModel):
    title: str
    description: str
    difficulty_level: str = Field(..., pattern="^(beginner|intermediate|advanced)$")
    estimated_duration: int  # in minutes


class CourseBase(BaseModel):
    title: str
    description: str
    category: str
    difficulty_level: str = Field(..., pattern="^(beginner|intermediate|advanced)$")
    topics: List[TopicBase] = []


class CourseCreate(CourseBase):
    teacher_id: str


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty_level: Optional[str] = None
    topics: Optional[List[TopicBase]] = None


class Course(CourseBase):
    id: str
    teacher_id: str
    created_at: str
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True


class EnrollmentRequest(BaseModel):
    course_id: str
    student_id: str


class Enrollment(BaseModel):
    id: str
    course_id: str
    student_id: str
    enrolled_at: str
    progress: float = 0.0
    
    class Config:
        from_attributes = True
