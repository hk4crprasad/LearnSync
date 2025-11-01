from datetime import datetime
from bson import ObjectId
from app.utils.database import get_assessments_collection, get_results_collection
from app.schemas.assessment import AssessmentCreate, AssessmentUpdate, AssessmentSubmission, QuestionResult, AssessmentResult
from app.utils.helpers import serialize_doc, serialize_list
from app.utils.ai_client import ai_client
from typing import Optional, List


class AssessmentService:
    def __init__(self):
        self.assessments_collection = get_assessments_collection()
        self.results_collection = get_results_collection()
    
    async def create_assessment(self, assessment_data: AssessmentCreate) -> dict:
        """Create a new assessment"""
        assessment_dict = assessment_data.model_dump()
        assessment_dict["created_at"] = datetime.utcnow().isoformat()
        
        result = await self.assessments_collection.insert_one(assessment_dict)
        assessment_dict["_id"] = result.inserted_id
        
        return serialize_doc(assessment_dict)
    
    async def get_assessment_by_id(self, assessment_id: str) -> Optional[dict]:
        """Get assessment by ID"""
        assessment = await self.assessments_collection.find_one({"_id": ObjectId(assessment_id)})
        return serialize_doc(assessment) if assessment else None
    
    async def get_assessments_by_course(self, course_id: str) -> List[dict]:
        """Get assessments by course"""
        cursor = self.assessments_collection.find({"course_id": course_id})
        assessments = await cursor.to_list(length=None)
        return serialize_list(assessments)
    
    async def update_assessment(self, assessment_id: str, assessment_data: AssessmentUpdate) -> Optional[dict]:
        """Update assessment"""
        update_data = {k: v for k, v in assessment_data.model_dump(exclude_unset=True).items()}
        
        if not update_data:
            return await self.get_assessment_by_id(assessment_id)
        
        result = await self.assessments_collection.find_one_and_update(
            {"_id": ObjectId(assessment_id)},
            {"$set": update_data},
            return_document=True
        )
        
        return serialize_doc(result) if result else None
    
    async def delete_assessment(self, assessment_id: str) -> bool:
        """Delete assessment"""
        result = await self.assessments_collection.delete_one({"_id": ObjectId(assessment_id)})
        return result.deleted_count > 0
    
    async def submit_assessment(self, submission: AssessmentSubmission) -> dict:
        """Submit assessment and generate AI feedback"""
        # Get assessment
        assessment = await self.get_assessment_by_id(submission.assessment_id)
        if not assessment:
            raise ValueError("Assessment not found")
        
        # Grade submission
        question_results = []
        total_points = 0
        earned_points = 0
        
        for i, question in enumerate(assessment["questions"]):
            total_points += question["points"]
            
            # Find student's answer
            student_answer = next(
                (ans.answer for ans in submission.answers if ans.question_index == i),
                None
            )
            
            # Check if answer is correct
            is_correct = student_answer == question["correct_answer"]
            points_earned = question["points"] if is_correct else 0
            earned_points += points_earned
            
            # Generate AI feedback
            ai_feedback = ai_client.generate_feedback(
                question["question_text"],
                student_answer or "No answer provided",
                question["correct_answer"]
            )
            
            question_results.append({
                "question_index": i,
                "question_text": question["question_text"],
                "student_answer": student_answer or "No answer provided",
                "correct_answer": question["correct_answer"],
                "is_correct": is_correct,
                "points_earned": points_earned,
                "ai_feedback": ai_feedback
            })
        
        # Calculate score
        score = (earned_points / total_points * 100) if total_points > 0 else 0
        passed = score >= assessment.get("passing_score", 60.0)
        
        # Generate overall feedback
        ai_overall_feedback = ai_client.generate_response(
            f"Student scored {score:.1f}% ({earned_points}/{total_points} points) on assessment '{assessment['title']}'. "
            f"Provide encouraging overall feedback and suggestions for improvement.",
            system_prompt="You are a supportive teacher providing constructive overall assessment feedback."
        )
        
        # Save result
        result_dict = {
            "assessment_id": submission.assessment_id,
            "student_id": submission.student_id,
            "score": score,
            "total_points": total_points,
            "earned_points": earned_points,
            "passed": passed,
            "question_results": question_results,
            "submitted_at": datetime.utcnow().isoformat(),
            "ai_overall_feedback": ai_overall_feedback
        }
        
        result = await self.results_collection.insert_one(result_dict)
        result_dict["_id"] = result.inserted_id
        
        return serialize_doc(result_dict)
    
    async def get_student_results(self, student_id: str, assessment_id: Optional[str] = None) -> List[dict]:
        """Get student results"""
        query = {"student_id": student_id}
        if assessment_id:
            query["assessment_id"] = assessment_id
        
        cursor = self.results_collection.find(query).sort("submitted_at", -1)
        results = await cursor.to_list(length=None)
        return serialize_list(results)


assessment_service = AssessmentService()
