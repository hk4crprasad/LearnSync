from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.schemas.user import User, UserUpdate, UserCreate
from app.services.user_service import user_service
from app.middleware.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/", response_model=List[User])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: dict = Depends(require_admin)
):
    """Get all users (Admin only)"""
    users = await user_service.get_all_users(skip, limit)
    # Remove hashed_password from all users
    for user in users:
        user.pop("hashed_password", None)
    return users


@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get user by ID"""
    # Allow users to get their own info or admins to get any user
    if current_user["id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this user")
    
    user = await user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.pop("hashed_password", None)
    return user


@router.put("/{user_id}", response_model=User)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: dict = Depends(require_admin)
):
    """Update user (Admin only)"""
    user = await user_service.update_user(user_id, user_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.pop("hashed_password", None)
    return user


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    """Delete user (Admin only)"""
    success = await user_service.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}
