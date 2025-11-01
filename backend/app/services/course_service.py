from datetime import datetime
from bson import ObjectId
from app.utils.database import get_courses_collection, get_enrollments_collection
from app.schemas.course import CourseCreate, CourseUpdate
from app.utils.helpers import serialize_doc, serialize_list
from typing import Optional, List


class CourseService:
    def __init__(self):
        self.collection = get_courses_collection()
        self.enrollments_collection = get_enrollments_collection()
    
    async def create_course(self, course_data: CourseCreate) -> dict:
        """Create a new course"""
        course_dict = course_data.model_dump()
        course_dict["created_at"] = datetime.utcnow().isoformat()
        course_dict["updated_at"] = datetime.utcnow().isoformat()
        
        result = await self.collection.insert_one(course_dict)
        course_dict["_id"] = result.inserted_id
        
        return serialize_doc(course_dict)
    
    async def get_course_by_id(self, course_id: str) -> Optional[dict]:
        """Get course by ID"""
        course = await self.collection.find_one({"_id": ObjectId(course_id)})
        return serialize_doc(course) if course else None
    
    async def get_all_courses(self, skip: int = 0, limit: int = 100) -> List[dict]:
        """Get all courses"""
        cursor = self.collection.find().skip(skip).limit(limit)
        courses = await cursor.to_list(length=limit)
        return serialize_list(courses)
    
    async def get_courses_by_teacher(self, teacher_id: str, skip: int = 0, limit: int = 100) -> List[dict]:
        """Get courses by teacher"""
        cursor = self.collection.find({"teacher_id": teacher_id}).skip(skip).limit(limit)
        courses = await cursor.to_list(length=limit)
        return serialize_list(courses)
    
    async def update_course(self, course_id: str, course_data: CourseUpdate) -> Optional[dict]:
        """Update course"""
        update_data = {k: v for k, v in course_data.model_dump(exclude_unset=True).items()}
        
        if not update_data:
            return await self.get_course_by_id(course_id)
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(course_id)},
            {"$set": update_data},
            return_document=True
        )
        
        return serialize_doc(result) if result else None
    
    async def delete_course(self, course_id: str) -> bool:
        """Delete course"""
        result = await self.collection.delete_one({"_id": ObjectId(course_id)})
        return result.deleted_count > 0
    
    async def search_courses(self, query: str, skip: int = 0, limit: int = 100) -> List[dict]:
        """Search courses by title or description"""
        cursor = self.collection.find({
            "$or": [
                {"title": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"category": {"$regex": query, "$options": "i"}}
            ]
        }).skip(skip).limit(limit)
        
        courses = await cursor.to_list(length=limit)
        return serialize_list(courses)
    
    async def enroll_student(self, course_id: str, student_id: str) -> dict:
        """Enroll a student in a course"""
        enrollment_data = {
            "course_id": course_id,
            "student_id": student_id,
            "enrolled_at": datetime.utcnow().isoformat(),
            "progress": 0.0
        }
        
        result = await self.enrollments_collection.insert_one(enrollment_data)
        enrollment_data["_id"] = result.inserted_id
        
        return serialize_doc(enrollment_data)
    
    async def get_enrollment(self, course_id: str, student_id: str) -> Optional[dict]:
        """Get enrollment for a student in a course"""
        enrollment = await self.enrollments_collection.find_one({
            "course_id": course_id,
            "student_id": student_id
        })
        return serialize_doc(enrollment) if enrollment else None
    
    async def get_enrolled_courses(self, student_id: str, skip: int = 0, limit: int = 100) -> List[dict]:
        """Get all courses a student is enrolled in"""
        # Get all enrollments for the student
        cursor = self.enrollments_collection.find({"student_id": student_id}).skip(skip).limit(limit)
        enrollments = await cursor.to_list(length=limit)
        
        # Get course details for each enrollment
        course_ids = [ObjectId(e["course_id"]) for e in enrollments]
        courses_cursor = self.collection.find({"_id": {"$in": course_ids}})
        courses = await courses_cursor.to_list(length=len(course_ids))
        
        return serialize_list(courses)
    
    async def unenroll_student(self, course_id: str, student_id: str) -> bool:
        """Unenroll a student from a course"""
        result = await self.enrollments_collection.delete_one({
            "course_id": course_id,
            "student_id": student_id
        })
        return result.deleted_count > 0
    
    async def update_enrollment_progress(self, course_id: str, student_id: str, progress: float) -> Optional[dict]:
        """Update student's progress in a course"""
        result = await self.enrollments_collection.find_one_and_update(
            {"course_id": course_id, "student_id": student_id},
            {"$set": {"progress": progress}},
            return_document=True
        )
        return serialize_doc(result) if result else None


course_service = CourseService()
