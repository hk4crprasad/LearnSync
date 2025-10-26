from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
from app.schemas.user import UserCreate, User, Token, LoginRequest, UserUpdate, RegisterResponse
from app.services.user_service import user_service
from app.utils.auth import create_access_token
from app.middleware.auth import get_current_user, require_admin
from config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user and return user data with access token"""
    try:
        user = await user_service.create_user(user_data)
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["id"], "role": user["role"]},
            expires_delta=access_token_expires
        )
        
        # Remove hashed_password from response
        user.pop("hashed_password", None)
        
        return {
            "user": user,
            "access_token": access_token,
            "token_type": "bearer"
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    """Login user"""
    user = await user_service.authenticate_user(login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    # Remove hashed_password from response
    current_user.pop("hashed_password", None)
    return current_user


@router.put("/me", response_model=User)
async def update_current_user(
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update current user information"""
    try:
        updated_user = await user_service.update_user(current_user["id"], user_data)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        updated_user.pop("hashed_password", None)
        return updated_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/recommendations")
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    """Get AI-powered personalized course recommendations"""
    try:
        recommendations = await user_service.get_personalized_recommendations(current_user["id"])
        return recommendations
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")
