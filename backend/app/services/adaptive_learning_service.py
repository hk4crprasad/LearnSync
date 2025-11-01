from datetime import datetime, timedelta
from bson import ObjectId
from app.utils.database import get_results_collection, get_assessments_collection, get_courses_collection
from app.utils.helpers import serialize_doc, serialize_list
from app.utils.ai_client import ai_client
from typing import Optional, List, Dict
from collections import defaultdict


class AdaptiveLearningService:
    def __init__(self):
        self.results_collection = get_results_collection()
        self.assessments_collection = get_assessments_collection()
        self.courses_collection = get_courses_collection()
    
    async def analyze_student_performance(self, student_id: str) -> Dict:
        """Analyze student's overall performance across all assessments"""
        # Get all student results
        cursor = self.results_collection.find({"student_id": student_id}).sort("submitted_at", -1)
        results = await cursor.to_list(length=None)
        
        if not results:
            return {
                "student_id": student_id,
                "total_assessments": 0,
                "average_score": 0,
                "performance_trend": "no_data",
                "strong_topics": [],
                "weak_topics": [],
                "needs_revision": []
            }
        
        # Calculate metrics
        scores = [r["score"] for r in results]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # Analyze by topic
        topic_performance = defaultdict(lambda: {"scores": [], "count": 0, "total_questions": 0, "correct": 0})
        
        for result in results:
            assessment = await self.assessments_collection.find_one({"_id": ObjectId(result["assessment_id"])})
            if assessment:
                topic = assessment.get("topic", "General")
                topic_performance[topic]["scores"].append(result["score"])
                topic_performance[topic]["count"] += 1
                
                # Analyze question-level performance
                for q_result in result.get("question_results", []):
                    topic_performance[topic]["total_questions"] += 1
                    if q_result.get("is_correct"):
                        topic_performance[topic]["correct"] += 1
        
        # Identify strong and weak topics
        strong_topics = []
        weak_topics = []
        needs_revision = []
        
        for topic, data in topic_performance.items():
            avg_topic_score = sum(data["scores"]) / len(data["scores"])
            accuracy = (data["correct"] / data["total_questions"] * 100) if data["total_questions"] > 0 else 0
            
            topic_info = {
                "topic": topic,
                "average_score": round(avg_topic_score, 2),
                "accuracy": round(accuracy, 2),
                "attempts": data["count"]
            }
            
            if avg_topic_score >= 85:
                strong_topics.append(topic_info)
            elif avg_topic_score < 60:
                weak_topics.append(topic_info)
                needs_revision.append(topic_info)
        
        # Determine performance trend
        if len(scores) >= 3:
            recent_avg = sum(scores[:3]) / 3
            older_avg = sum(scores[3:]) / len(scores[3:]) if len(scores) > 3 else recent_avg
            
            if recent_avg > older_avg + 10:
                trend = "improving"
            elif recent_avg < older_avg - 10:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
        
        return {
            "student_id": student_id,
            "total_assessments": len(results),
            "average_score": round(avg_score, 2),
            "performance_trend": trend,
            "strong_topics": sorted(strong_topics, key=lambda x: x["average_score"], reverse=True)[:5],
            "weak_topics": sorted(weak_topics, key=lambda x: x["average_score"])[:5],
            "needs_revision": sorted(needs_revision, key=lambda x: x["average_score"])[:5],
            "recent_scores": scores[:10],
            "last_assessment_date": results[0]["submitted_at"] if results else None
        }
    
    async def generate_personalized_study_plan(self, student_id: str) -> Dict:
        """Generate AI-powered personalized study plan"""
        # Get performance analysis
        performance = await self.analyze_student_performance(student_id)
        
        if performance["total_assessments"] == 0:
            return {
                "student_id": student_id,
                "status": "no_data",
                "message": "Complete some assessments to get personalized recommendations",
                "suggested_actions": [
                    "Enroll in courses",
                    "Take practice assessments",
                    "Complete course assignments"
                ]
            }
        
        # Get enrolled courses
        # This would need course enrollment data
        
        # Generate AI recommendations
        weak_topics_str = ", ".join([t["topic"] for t in performance["weak_topics"]]) if performance["weak_topics"] else "None identified"
        strong_topics_str = ", ".join([t["topic"] for t in performance["strong_topics"]]) if performance["strong_topics"] else "None yet"
        
        ai_recommendations = ai_client.generate_response(
            f"""
            Student Performance Summary:
            - Average Score: {performance["average_score"]}%
            - Performance Trend: {performance["performance_trend"]}
            - Weak Topics: {weak_topics_str}
            - Strong Topics: {strong_topics_str}
            - Total Assessments Taken: {performance["total_assessments"]}
            
            Based on this data, create a detailed personalized study plan including:
            1. Priority topics to focus on (start with weakest)
            2. Recommended study schedule (daily/weekly)
            3. Specific exercises or practice types for each weak topic
            4. Revision schedule for topics needing review
            5. Motivational message based on their performance trend
            6. Next milestone goals
            
            Format the response as actionable steps.
            """,
            system_prompt="You are an expert educational advisor creating personalized study plans for students."
        )
        
        # Generate revision cycles
        revision_cycles = []
        for topic_data in performance["needs_revision"]:
            revision_cycles.append({
                "topic": topic_data["topic"],
                "current_mastery": topic_data["accuracy"],
                "target_mastery": 85.0,
                "recommended_frequency": "daily" if topic_data["accuracy"] < 50 else "every_2_days",
                "estimated_time_minutes": 30,
                "next_revision_date": (datetime.utcnow() + timedelta(days=1)).isoformat()
            })
        
        return {
            "student_id": student_id,
            "generated_at": datetime.utcnow().isoformat(),
            "performance_summary": performance,
            "ai_study_plan": ai_recommendations,
            "revision_cycles": revision_cycles,
            "adaptive_goals": self._generate_adaptive_goals(performance),
            "recommended_practice_topics": [t["topic"] for t in performance["weak_topics"][:3]]
        }
    
    def _generate_adaptive_goals(self, performance: Dict) -> List[Dict]:
        """Generate adaptive learning goals based on performance"""
        goals = []
        
        avg_score = performance["average_score"]
        
        # Score improvement goal
        if avg_score < 70:
            goals.append({
                "type": "score_improvement",
                "description": f"Achieve 70% average score (currently {avg_score:.1f}%)",
                "target": 70,
                "current": avg_score,
                "priority": "high"
            })
        elif avg_score < 85:
            goals.append({
                "type": "score_improvement",
                "description": f"Achieve 85% average score (currently {avg_score:.1f}%)",
                "target": 85,
                "current": avg_score,
                "priority": "medium"
            })
        
        # Weak topic mastery goals
        for topic_data in performance["weak_topics"][:3]:
            goals.append({
                "type": "topic_mastery",
                "description": f"Master '{topic_data['topic']}' (current: {topic_data['accuracy']:.1f}%)",
                "topic": topic_data["topic"],
                "target": 80,
                "current": topic_data["accuracy"],
                "priority": "high"
            })
        
        # Consistency goal
        if performance["performance_trend"] == "declining":
            goals.append({
                "type": "consistency",
                "description": "Stabilize performance and prevent further decline",
                "priority": "high"
            })
        
        return goals
    
    async def get_adaptive_hints(self, question_text: str, student_performance: Dict, difficulty: str) -> List[str]:
        """Generate progressive hints based on student's struggle patterns"""
        # Determine hint level based on performance
        avg_score = student_performance.get("average_score", 50)
        
        if avg_score >= 80:
            hint_level = "minimal"  # Just nudge in right direction
        elif avg_score >= 60:
            hint_level = "moderate"  # More substantial help
        else:
            hint_level = "detailed"  # Step-by-step guidance
        
        hints_prompt = f"""
        Question: {question_text}
        Difficulty: {difficulty}
        Student Average Score: {avg_score}%
        Hint Level Needed: {hint_level}
        
        Generate 3 progressive hints:
        1. Hint 1 (Gentle nudge): A subtle clue without giving away the answer
        2. Hint 2 (More direct): Point to the key concept or approach
        3. Hint 3 (Almost there): Nearly reveal the answer while still requiring student thought
        
        Return as JSON array: ["hint1", "hint2", "hint3"]
        """
        
        response = ai_client.generate_response(
            hints_prompt,
            system_prompt="You are a patient tutor providing progressive hints. Return only valid JSON array."
        )
        
        try:
            import json
            import re
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                hints = json.loads(json_match.group(0))
                return hints
        except:
            pass
        
        # Fallback hints
        return [
            "Think about the key concepts covered in this topic.",
            "Review the fundamental principles and how they apply here.",
            "Consider breaking the problem into smaller steps."
        ]
    
    async def generate_adaptive_feedback(self, 
                                        question: Dict, 
                                        student_answer: str, 
                                        is_correct: bool,
                                        student_performance: Dict) -> str:
        """Generate personalized feedback based on student's learning history"""
        
        avg_score = student_performance.get("average_score", 50)
        trend = student_performance.get("performance_trend", "stable")
        
        feedback_prompt = f"""
        Question: {question.get('question_text')}
        Student's Answer: {student_answer}
        Correct Answer: {question.get('correct_answer')}
        Result: {'Correct' if is_correct else 'Incorrect'}
        
        Student Context:
        - Average Score: {avg_score}%
        - Performance Trend: {trend}
        - Learning Stage: {'Advanced' if avg_score >= 80 else 'Intermediate' if avg_score >= 60 else 'Beginner'}
        
        Provide personalized feedback that:
        1. Acknowledges their answer
        2. Explains the correct concept (if wrong) or reinforces understanding (if right)
        3. Connects to their learning level
        4. {'Encourages them given their improving trend' if trend == 'improving' else 'Provides extra support given their struggle' if trend == 'declining' else 'Maintains their momentum'}
        5. Suggests what to study next for this topic
        
        Be supportive, clear, and educational. Max 3-4 sentences.
        """
        
        feedback = ai_client.generate_response(
            feedback_prompt,
            system_prompt="You are an empathetic tutor providing personalized feedback."
        )
        
        return feedback


adaptive_learning_service = AdaptiveLearningService()
