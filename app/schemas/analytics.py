from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class ProgressBase(BaseModel):
    student_id: str
    course_id: str
    completed_topics: List[str] = []
    current_topic: Optional[str] = None
    total_time_spent: int = 0  # in minutes
    completion_percentage: float = 0.0


class Progress(ProgressBase):
    id: str
    last_updated: str
    
    class Config:
        from_attributes = True


class TopicMastery(BaseModel):
    topic: str
    mastery_level: float  # 0-100
    attempts: int
    average_score: float


class StudentAnalytics(BaseModel):
    student_id: str
    course_id: str
    progress: Progress
    average_score: float
    total_assessments: int
    passed_assessments: int
    learning_speed: str  # slow, medium, fast
    improvement_rate: float
    topic_masteries: List[TopicMastery]
    weak_areas: List[str]
    strong_areas: List[str]
    recommendations: Optional[str] = None
    
    class Config:
        from_attributes = True


class ClassAnalytics(BaseModel):
    course_id: str
    teacher_id: str
    total_students: int
    average_completion: float
    average_score: float
    top_performers: List[Dict]
    struggling_students: List[Dict]
    popular_topics: List[str]
    challenging_topics: List[str]
    
    class Config:
        from_attributes = True
