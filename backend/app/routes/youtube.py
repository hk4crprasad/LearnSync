"""
YouTube API Routes
Endpoints for searching and retrieving YouTube educational content
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.services.youtube_service import youtube_service
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/youtube", tags=["YouTube"])


class VideoResponse(BaseModel):
    """YouTube video information"""
    id: str
    title: str
    description: str
    thumbnail: str
    channel: str
    channel_id: str
    published_at: str
    duration: str
    view_count: int
    like_count: int
    comment_count: int
    url: str
    embed_url: str


class SearchResponse(BaseModel):
    """YouTube search results"""
    query: str
    videos: List[VideoResponse]
    total_results: int


class AISearchResponse(BaseModel):
    """AI-powered YouTube search results"""
    topic: str
    keywords: List[str]
    videos: List[VideoResponse]


class KeywordRequest(BaseModel):
    """Request for AI keyword generation"""
    topic: str
    user_context: Optional[str] = None


@router.get("/search", response_model=SearchResponse)
async def search_youtube_videos(
    q: str = Query(..., min_length=1, description="Search query"),
    max_results: int = Query(12, ge=1, le=50, description="Maximum results"),
    order: str = Query("relevance", description="Sort order: relevance, rating, viewCount, date"),
    duration: Optional[str] = Query(None, description="Video duration: short, medium, long"),
    current_user: dict = Depends(get_current_user)
):
    """
    Search YouTube for educational videos
    
    Query parameters:
    - q: Search query (required)
    - max_results: Maximum number of results (1-50, default: 12)
    - order: Sort order (relevance, rating, viewCount, date)
    - duration: Filter by duration (short: <4min, medium: 4-20min, long: >20min)
    """
    videos = await youtube_service.search_videos(
        query=q,
        max_results=max_results,
        order=order,
        video_duration=duration
    )
    
    return SearchResponse(
        query=q,
        videos=videos,
        total_results=len(videos)
    )


@router.post("/ai-search", response_model=AISearchResponse)
async def ai_powered_search(
    request: KeywordRequest,
    max_results: int = Query(12, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """
    AI-powered YouTube search with automatic keyword generation
    
    The AI analyzes the topic and generates optimized search keywords,
    then searches YouTube for the best educational content.
    
    Request body:
    - topic: Main topic/subject to search for
    - user_context: Optional context (learning level, interests, etc.)
    """
    results = await youtube_service.search_with_ai_keywords(
        topic=request.topic,
        user_context=request.user_context,
        max_results=max_results
    )
    
    return AISearchResponse(
        topic=results['topic'],
        keywords=results['keywords'],
        videos=results['videos']
    )


@router.post("/generate-keywords")
async def generate_search_keywords(
    request: KeywordRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate AI-optimized search keywords for a topic
    
    Request body:
    - topic: Main topic/subject
    - user_context: Optional user context
    """
    keywords = await youtube_service.generate_search_keywords(
        topic=request.topic,
        user_context=request.user_context
    )
    
    return {
        "topic": request.topic,
        "keywords": keywords,
        "message": f"Generated {len(keywords)} search keywords"
    }


@router.get("/channel/{channel_id}")
async def get_channel_info(
    channel_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get information about a YouTube channel"""
    channel = await youtube_service.get_channel_info(channel_id)
    
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    return channel


@router.get("/course-suggestions")
async def get_course_suggestions(
    topic: str = Query(..., min_length=1),
    level: str = Query("beginner", description="Learning level: beginner, intermediate, advanced"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get AI-curated YouTube course suggestions for a topic
    
    This endpoint:
    1. Generates contextual keywords based on topic and level
    2. Searches for high-quality educational content
    3. Filters for longer videos (courses/tutorials)
    """
    # Add level context for better keyword generation
    user_context = f"Learning level: {level}. Looking for comprehensive courses and tutorials."
    
    results = await youtube_service.search_with_ai_keywords(
        topic=topic,
        user_context=user_context,
        max_results=20
    )
    
    # Filter for longer videos (likely full courses)
    videos = results['videos']
    
    return {
        "topic": topic,
        "level": level,
        "keywords_used": results['keywords'],
        "courses": videos,
        "total_found": len(videos),
        "message": f"Found {len(videos)} educational videos for {topic}"
    }
