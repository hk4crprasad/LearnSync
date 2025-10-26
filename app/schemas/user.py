from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from enum import Enum


class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.STUDENT
    # Personalization fields
    college_name: Optional[str] = None
    class_grade: Optional[str] = None  # e.g., "10th Grade", "12th Grade", "Undergraduate"
    major_subject: Optional[str] = None  # e.g., "Science", "Commerce", "Engineering"
    phone_number: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    learning_preferences: Optional[List[str]] = []  # e.g., ["Visual", "Hands-on", "Reading"]
    interests: Optional[List[str]] = []  # e.g., ["Math", "Physics", "Programming"]
    goals: Optional[str] = None  # Student's learning goals
    profile_picture: Optional[str] = None  # URL or path


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    college_name: Optional[str] = None
    class_grade: Optional[str] = None
    major_subject: Optional[str] = None
    phone_number: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    learning_preferences: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    goals: Optional[str] = None
    profile_picture: Optional[str] = None


class UserInDB(UserBase):
    id: str
    hashed_password: str
    is_active: bool = True
    created_at: str
    
    class Config:
        from_attributes = True


class User(UserBase):
    id: str
    is_active: bool = True
    created_at: str
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[UserRole] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterResponse(BaseModel):
    user: User
    access_token: str
    token_type: str = "bearer"
    
    class Config:
        from_attributes = True
