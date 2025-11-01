from fastapi import APIRouter, Depends, HTTPException
from app.schemas.analytics import StudentAnalytics, ClassAnalytics, Progress
from app.services.analytics_service import analytics_service
from app.services.adaptive_learning_service import adaptive_learning_service
from app.middleware.auth import get_current_user, require_teacher

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.post("/progress")
async def update_progress(
    student_id: str,
    course_id: str,
    progress_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update student progress"""
    # Students can only update their own progress
    if current_user["role"] == "student" and student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Cannot update other students' progress")
    
    progress = await analytics_service.update_progress(student_id, course_id, progress_data)
    return progress


@router.get("/progress/student/{student_id}")
async def get_student_progress(
    student_id: str,
    course_id: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Get student progress"""
    # Students can only view their own progress
    if current_user["role"] == "student" and student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Cannot view other students' progress")
    
    progress = await analytics_service.get_student_progress(student_id, course_id)
    return progress


@router.get("/student/{student_id}/course/{course_id}", response_model=StudentAnalytics)
async def get_student_analytics(
    student_id: str,
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive student analytics"""
    # Students can only view their own analytics
    if current_user["role"] == "student" and student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Cannot view other students' analytics")
    
    analytics = await analytics_service.get_student_analytics(student_id, course_id)
    return analytics


@router.get("/class/course/{course_id}", response_model=ClassAnalytics)
async def get_class_analytics(
    course_id: str,
    current_user: dict = Depends(require_teacher)
):
    """Get class-wide analytics (Teacher/Admin only)"""
    analytics = await analytics_service.get_class_analytics(course_id, current_user["id"])
    return analytics


@router.get("/adaptive/performance")
async def get_adaptive_performance(
    current_user: dict = Depends(get_current_user)
):
    """Get AI-analyzed performance data for adaptive learning"""
    student_id = current_user["id"]
    performance = await adaptive_learning_service.analyze_student_performance(student_id)
    return performance


@router.get("/adaptive/study-plan")
async def get_personalized_study_plan(
    current_user: dict = Depends(get_current_user)
):
    """Get AI-generated personalized study plan"""
    student_id = current_user["id"]
    study_plan = await adaptive_learning_service.generate_personalized_study_plan(student_id)
    return study_plan


@router.post("/adaptive/hints")
async def get_adaptive_hints(
    question_text: str,
    difficulty: str,
    current_user: dict = Depends(get_current_user)
):
    """Get progressive hints for a question based on student performance"""
    student_id = current_user["id"]
    performance = await adaptive_learning_service.analyze_student_performance(student_id)
    hints = await adaptive_learning_service.get_adaptive_hints(
        question_text=question_text,
        student_performance=performance,
        difficulty=difficulty
    )
    return {"hints": hints}


@router.post("/adaptive/feedback")
async def get_adaptive_feedback(
    question: dict,
    student_answer: str,
    is_correct: bool,
    current_user: dict = Depends(get_current_user)
):
    """Get personalized feedback based on student's learning history"""
    student_id = current_user["id"]
    performance = await adaptive_learning_service.analyze_student_performance(student_id)
    feedback = await adaptive_learning_service.generate_adaptive_feedback(
        question=question,
        student_answer=student_answer,
        is_correct=is_correct,
        student_performance=performance
    )
    return {"feedback": feedback}
