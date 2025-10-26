from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.schemas.course import Course, CourseCreate, CourseUpdate
from app.services.course_service import course_service
from app.middleware.auth import get_current_user, require_teacher

router = APIRouter(prefix="/api/courses", tags=["Courses"])


@router.post("/", response_model=Course, status_code=201)
async def create_course(
    course_data: CourseCreate,
    current_user: dict = Depends(require_teacher)
):
    """Create a new course (Teacher/Admin only)"""
    # Ensure teacher_id matches current user
    course_data.teacher_id = current_user["id"]
    course = await course_service.create_course(course_data)
    return course


@router.get("/", response_model=List[Course])
async def get_all_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get all courses"""
    courses = await course_service.get_all_courses(skip, limit)
    return courses


@router.get("/search", response_model=List[Course])
async def search_courses(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Search courses by title, description, or category"""
    courses = await course_service.search_courses(q, skip, limit)
    return courses


@router.get("/teacher/{teacher_id}", response_model=List[Course])
async def get_teacher_courses(
    teacher_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get courses by teacher"""
    courses = await course_service.get_courses_by_teacher(teacher_id, skip, limit)
    return courses


@router.get("/{course_id}", response_model=Course)
async def get_course(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get course by ID"""
    course = await course_service.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.put("/{course_id}", response_model=Course)
async def update_course(
    course_id: str,
    course_data: CourseUpdate,
    current_user: dict = Depends(require_teacher)
):
    """Update course (Teacher/Admin only)"""
    # Check if user is the course creator or admin
    course = await course_service.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if course["teacher_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this course")
    
    updated_course = await course_service.update_course(course_id, course_data)
    return updated_course


@router.delete("/{course_id}")
async def delete_course(
    course_id: str,
    current_user: dict = Depends(require_teacher)
):
    """Delete course (Teacher/Admin only)"""
    course = await course_service.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if course["teacher_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this course")
    
    success = await course_service.delete_course(course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return {"message": "Course deleted successfully"}
