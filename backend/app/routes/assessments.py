from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas.assessment import Assessment, AssessmentCreate, AssessmentUpdate, AssessmentSubmission, AssessmentResult
from app.services.assessment_service import assessment_service
from app.services.gamification_service import gamification_service
from app.middleware.auth import get_current_user, require_teacher

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])


@router.post("/", response_model=Assessment, status_code=201)
async def create_assessment(
    assessment_data: AssessmentCreate,
    current_user: dict = Depends(require_teacher)
):
    """Create a new assessment (Teacher/Admin only)"""
    assessment_data.teacher_id = current_user["id"]
    assessment = await assessment_service.create_assessment(assessment_data)
    return assessment


@router.get("/course/{course_id}", response_model=List[Assessment])
async def get_course_assessments(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all assessments for a course"""
    assessments = await assessment_service.get_assessments_by_course(course_id)
    return assessments


@router.get("/{assessment_id}", response_model=Assessment)
async def get_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get assessment by ID"""
    assessment = await assessment_service.get_assessment_by_id(assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@router.post("/generate-questions")
async def generate_questions(
    request: dict,
    current_user: dict = Depends(get_current_user)
):
    """Generate AI-powered questions for assessment (Available to all authenticated users)"""
    try:
        from app.utils.ai_client import ai_client
        
        topic = request.get("topic", "")
        course_description = request.get("course_description", "")
        difficulty_level = request.get("difficulty_level", "beginner")
        num_questions = request.get("num_questions", 5)
        question_type = request.get("question_type", "multiple_choice")
        
        if not topic:
            raise HTTPException(status_code=400, detail="Topic is required")
        
        # Limit students to 10 questions per generation
        if current_user["role"] == "student":
            num_questions = min(num_questions, 10)
        
        questions = ai_client.generate_questions(
            topic=topic,
            course_description=course_description,
            difficulty_level=difficulty_level,
            num_questions=num_questions,
            question_type=question_type
        )
        
        if not questions:
            raise HTTPException(status_code=500, detail="Failed to generate questions")
        
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")


@router.put("/{assessment_id}", response_model=Assessment)
async def update_assessment(
    assessment_id: str,
    assessment_data: AssessmentUpdate,
    current_user: dict = Depends(require_teacher)
):
    """Update assessment (Teacher/Admin only)"""
    assessment = await assessment_service.get_assessment_by_id(assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    if assessment["teacher_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this assessment")
    
    updated_assessment = await assessment_service.update_assessment(assessment_id, assessment_data)
    return updated_assessment


@router.delete("/{assessment_id}")
async def delete_assessment(
    assessment_id: str,
    current_user: dict = Depends(require_teacher)
):
    """Delete assessment (Teacher/Admin only)"""
    assessment = await assessment_service.get_assessment_by_id(assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    if assessment["teacher_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this assessment")
    
    success = await assessment_service.delete_assessment(assessment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    return {"message": "Assessment deleted successfully"}


@router.post("/submit", response_model=AssessmentResult)
async def submit_assessment(
    submission: AssessmentSubmission,
    current_user: dict = Depends(get_current_user)
):
    """Submit assessment and get AI-powered feedback"""
    # Ensure student_id matches current user (unless admin/teacher)
    if current_user["role"] == "student" and submission.student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Cannot submit assessment for another student")
    
    try:
        result = await assessment_service.submit_assessment(submission)
        
        # Award points for completing assessment
        await gamification_service.add_points(
            submission.student_id,
            int(result["score"] / 10),  # 1 point per 10% score
            f"Completed assessment with {result['score']:.1f}% score"
        )
        
        # Check for auto-badges
        await gamification_service.check_and_award_auto_badges(
            submission.student_id,
            "assessment_completed",
            {"score": result["score"]}
        )
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/results/student/{student_id}", response_model=List[AssessmentResult])
async def get_student_results(
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get assessment results for a student"""
    # Students can only view their own results
    if current_user["role"] == "student" and student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Cannot view other students' results")
    
    results = await assessment_service.get_student_results(student_id)
    return results


@router.get("/results/{assessment_id}/student/{student_id}", response_model=List[AssessmentResult])
async def get_student_assessment_results(
    assessment_id: str,
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific assessment results for a student"""
    if current_user["role"] == "student" and student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Cannot view other students' results")
    
    results = await assessment_service.get_student_results(student_id, assessment_id)
    return results
