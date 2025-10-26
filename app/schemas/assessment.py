from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class QuestionOption(BaseModel):
    text: str
    is_correct: bool


class QuestionBase(BaseModel):
    question_text: str
    question_type: str = Field(..., pattern="^(multiple_choice|true_false|short_answer)$")
    options: Optional[List[QuestionOption]] = None
    correct_answer: str
    points: int = 1
    explanation: Optional[str] = None


class AssessmentBase(BaseModel):
    title: str
    description: str
    course_id: str
    topic: str
    questions: List[QuestionBase]
    time_limit: Optional[int] = None  # in minutes
    passing_score: float = 60.0


class AssessmentCreate(AssessmentBase):
    teacher_id: str


class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    questions: Optional[List[QuestionBase]] = None
    time_limit: Optional[int] = None
    passing_score: Optional[float] = None


class Assessment(AssessmentBase):
    id: str
    teacher_id: str
    created_at: str
    
    class Config:
        from_attributes = True


class AnswerSubmission(BaseModel):
    question_index: int
    answer: str


class AssessmentSubmission(BaseModel):
    assessment_id: str
    student_id: str
    answers: List[AnswerSubmission]


class QuestionResult(BaseModel):
    question_index: int
    question_text: str
    student_answer: str
    correct_answer: str
    is_correct: bool
    points_earned: int
    ai_feedback: Optional[str] = None


class AssessmentResult(BaseModel):
    id: str
    assessment_id: str
    student_id: str
    score: float
    total_points: int
    earned_points: int
    passed: bool
    question_results: List[QuestionResult]
    submitted_at: str
    ai_overall_feedback: Optional[str] = None
    
    class Config:
        from_attributes = True
