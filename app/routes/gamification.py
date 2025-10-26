from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.schemas.gamification import Reward, AwardBadge, AddPoints, Leaderboard
from app.services.gamification_service import gamification_service, BADGES
from app.middleware.auth import get_current_user, require_teacher

router = APIRouter(prefix="/api/rewards", tags=["Gamification"])


@router.get("/badges")
async def get_available_badges():
    """Get all available badges"""
    return {"badges": BADGES}


@router.get("/student/{student_id}", response_model=Reward)
async def get_student_rewards(
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get student's rewards and achievements"""
    # Students can only view their own rewards
    if current_user["role"] == "student" and student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Cannot view other students' rewards")
    
    rewards = await gamification_service.get_student_rewards(student_id)
    return rewards


@router.post("/points", response_model=Reward)
async def add_points(
    points_data: AddPoints,
    current_user: dict = Depends(require_teacher)
):
    """Add points to a student (Teacher/Admin only)"""
    rewards = await gamification_service.add_points(
        points_data.student_id,
        points_data.points,
        points_data.reason
    )
    return rewards


@router.post("/badge", response_model=Reward)
async def award_badge(
    badge_data: AwardBadge,
    current_user: dict = Depends(require_teacher)
):
    """Award a badge to a student (Teacher/Admin only)"""
    if badge_data.badge_name not in BADGES:
        raise HTTPException(status_code=400, detail="Invalid badge name")
    
    rewards = await gamification_service.award_badge(
        badge_data.student_id,
        badge_data.badge_name,
        badge_data.reason
    )
    return rewards


@router.get("/leaderboard", response_model=Leaderboard)
async def get_leaderboard(
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get leaderboard"""
    leaderboard = await gamification_service.get_leaderboard(limit)
    return leaderboard
