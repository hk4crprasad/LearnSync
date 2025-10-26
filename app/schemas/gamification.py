from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class BadgeBase(BaseModel):
    name: str
    description: str
    icon: str
    criteria: str


class RewardBase(BaseModel):
    student_id: str
    points: int = 0
    badges: List[str] = []
    level: int = 1
    achievements: List[str] = []


class Reward(RewardBase):
    id: str
    total_points: int = 0
    created_at: str
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True


class AwardBadge(BaseModel):
    student_id: str
    badge_name: str
    reason: str


class AddPoints(BaseModel):
    student_id: str
    points: int
    reason: str


class LeaderboardEntry(BaseModel):
    rank: int
    student_id: str
    student_name: str
    points: int
    level: int
    badges_count: int


class Leaderboard(BaseModel):
    entries: List[LeaderboardEntry]
    total_students: int
