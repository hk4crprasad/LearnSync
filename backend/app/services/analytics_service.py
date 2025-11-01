from datetime import datetime
from bson import ObjectId
from app.utils.database import get_progress_collection, get_results_collection
from app.utils.helpers import serialize_doc, serialize_list
from app.utils.ai_client import ai_client
from typing import Optional, List, Dict


class AnalyticsService:
    def __init__(self):
        self.progress_collection = get_progress_collection()
        self.results_collection = get_results_collection()
    
    async def update_progress(self, student_id: str, course_id: str, progress_data: dict) -> dict:
        """Update student progress"""
        existing = await self.progress_collection.find_one({
            "student_id": student_id,
            "course_id": course_id
        })
        
        if existing:
            # Update existing progress
            update_data = {**progress_data, "last_updated": datetime.utcnow().isoformat()}
            result = await self.progress_collection.find_one_and_update(
                {"_id": existing["_id"]},
                {"$set": update_data},
                return_document=True
            )
        else:
            # Create new progress
            progress_dict = {
                "student_id": student_id,
                "course_id": course_id,
                **progress_data,
                "last_updated": datetime.utcnow().isoformat()
            }
            result = await self.progress_collection.insert_one(progress_dict)
            progress_dict["_id"] = result.inserted_id
            result = progress_dict
        
        return serialize_doc(result)
    
    async def get_student_progress(self, student_id: str, course_id: Optional[str] = None) -> List[dict]:
        """Get student progress"""
        query = {"student_id": student_id}
        if course_id:
            query["course_id"] = course_id
        
        cursor = self.progress_collection.find(query)
        progress = await cursor.to_list(length=None)
        return serialize_list(progress)
    
    async def get_student_analytics(self, student_id: str, course_id: str) -> dict:
        """Get comprehensive student analytics"""
        # Get progress
        progress_list = await self.get_student_progress(student_id, course_id)
        progress = progress_list[0] if progress_list else {}
        
        # Get assessment results
        results = await self.results_collection.find({
            "student_id": student_id
        }).to_list(length=None)
        
        if not results:
            return {
                "student_id": student_id,
                "course_id": course_id,
                "progress": progress,
                "average_score": 0,
                "total_assessments": 0,
                "passed_assessments": 0,
                "learning_speed": "N/A",
                "improvement_rate": 0,
                "topic_masteries": [],
                "weak_areas": [],
                "strong_areas": [],
                "recommendations": "Complete more assessments to get personalized analytics."
            }
        
        # Calculate metrics
        total_assessments = len(results)
        passed_assessments = sum(1 for r in results if r.get("passed", False))
        average_score = sum(r.get("score", 0) for r in results) / total_assessments
        
        # Analyze topic mastery
        topic_scores: Dict[str, List[float]] = {}
        for result in results:
            # You would need to track topic information in results
            topic = "General"  # Placeholder
            if topic not in topic_scores:
                topic_scores[topic] = []
            topic_scores[topic].append(result.get("score", 0))
        
        topic_masteries = [
            {
                "topic": topic,
                "mastery_level": sum(scores) / len(scores),
                "attempts": len(scores),
                "average_score": sum(scores) / len(scores)
            }
            for topic, scores in topic_scores.items()
        ]
        
        # Identify weak and strong areas
        weak_areas = [tm["topic"] for tm in topic_masteries if tm["mastery_level"] < 60]
        strong_areas = [tm["topic"] for tm in topic_masteries if tm["mastery_level"] >= 80]
        
        # Calculate learning speed
        time_spent = progress.get("total_time_spent", 0)
        topics_completed = len(progress.get("completed_topics", []))
        if topics_completed > 0 and time_spent > 0:
            avg_time_per_topic = time_spent / topics_completed
            if avg_time_per_topic < 30:
                learning_speed = "fast"
            elif avg_time_per_topic < 60:
                learning_speed = "medium"
            else:
                learning_speed = "slow"
        else:
            learning_speed = "N/A"
        
        # Calculate improvement rate
        if len(results) >= 2:
            first_half = results[:len(results)//2]
            second_half = results[len(results)//2:]
            first_avg = sum(r.get("score", 0) for r in first_half) / len(first_half)
            second_avg = sum(r.get("score", 0) for r in second_half) / len(second_half)
            improvement_rate = second_avg - first_avg
        else:
            improvement_rate = 0
        
        # Generate AI recommendations
        recommendations = ai_client.suggest_next_topic(
            progress.get("completed_topics", []),
            {
                "avg_score": average_score,
                "strong_areas": strong_areas,
                "weak_areas": weak_areas
            }
        )
        
        return {
            "student_id": student_id,
            "course_id": course_id,
            "progress": progress,
            "average_score": average_score,
            "total_assessments": total_assessments,
            "passed_assessments": passed_assessments,
            "learning_speed": learning_speed,
            "improvement_rate": improvement_rate,
            "topic_masteries": topic_masteries,
            "weak_areas": weak_areas,
            "strong_areas": strong_areas,
            "recommendations": recommendations
        }
    
    async def get_class_analytics(self, course_id: str, teacher_id: str) -> dict:
        """Get class-wide analytics"""
        # Get all progress for this course
        cursor = self.progress_collection.find({"course_id": course_id})
        all_progress = await cursor.to_list(length=None)
        
        total_students = len(all_progress)
        
        if total_students == 0:
            return {
                "course_id": course_id,
                "teacher_id": teacher_id,
                "total_students": 0,
                "average_completion": 0,
                "average_score": 0,
                "top_performers": [],
                "struggling_students": [],
                "popular_topics": [],
                "challenging_topics": []
            }
        
        # Calculate average completion
        average_completion = sum(p.get("completion_percentage", 0) for p in all_progress) / total_students
        
        # Get student IDs
        student_ids = [p["student_id"] for p in all_progress]
        
        # Get all results for these students
        cursor = self.results_collection.find({"student_id": {"$in": student_ids}})
        all_results = await cursor.to_list(length=None)
        
        # Calculate average score
        if all_results:
            average_score = sum(r.get("score", 0) for r in all_results) / len(all_results)
        else:
            average_score = 0
        
        # Calculate student performance
        student_performance = {}
        for result in all_results:
            sid = result["student_id"]
            if sid not in student_performance:
                student_performance[sid] = []
            student_performance[sid].append(result.get("score", 0))
        
        student_averages = [
            {"student_id": sid, "average_score": sum(scores) / len(scores)}
            for sid, scores in student_performance.items()
        ]
        
        # Top performers and struggling students
        student_averages.sort(key=lambda x: x["average_score"], reverse=True)
        top_performers = student_averages[:5]
        struggling_students = [s for s in student_averages if s["average_score"] < 60][:5]
        
        # Popular and challenging topics
        topic_data: Dict[str, Dict] = {}
        for progress in all_progress:
            for topic in progress.get("completed_topics", []):
                if topic not in topic_data:
                    topic_data[topic] = {"completions": 0, "scores": []}
                topic_data[topic]["completions"] += 1
        
        popular_topics = sorted(topic_data.keys(), key=lambda t: topic_data[t]["completions"], reverse=True)[:5]
        
        return {
            "course_id": course_id,
            "teacher_id": teacher_id,
            "total_students": total_students,
            "average_completion": average_completion,
            "average_score": average_score,
            "top_performers": top_performers,
            "struggling_students": struggling_students,
            "popular_topics": popular_topics,
            "challenging_topics": []  # Would need more data to determine
        }


analytics_service = AnalyticsService()
