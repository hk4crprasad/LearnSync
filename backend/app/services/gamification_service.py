from datetime import datetime
from bson import ObjectId
from app.utils.database import get_rewards_collection, get_users_collection
from app.utils.helpers import serialize_doc, serialize_list
from typing import Optional, List


# Badge definitions
BADGES = {
    "first_steps": {"name": "First Steps", "description": "Complete your first lesson", "icon": "🚀"},
    "perfect_score": {"name": "Perfect Score", "description": "Get 100% on an assessment", "icon": "💯"},
    "consistent_learner": {"name": "Consistent Learner", "description": "Study for 7 days in a row", "icon": "📚"},
    "quick_learner": {"name": "Quick Learner", "description": "Complete a course in record time", "icon": "⚡"},
    "helping_hand": {"name": "Helping Hand", "description": "Help 5 classmates", "icon": "🤝"},
    "overachiever": {"name": "Overachiever", "description": "Score above 90% on 5 assessments", "icon": "🌟"},
}


class GamificationService:
    def __init__(self):
        self.collection = get_rewards_collection()
        self.users_collection = get_users_collection()
    
    async def get_or_create_reward(self, student_id: str) -> dict:
        """Get or create reward record for student"""
        reward = await self.collection.find_one({"student_id": student_id})
        
        if not reward:
            reward_dict = {
                "student_id": student_id,
                "points": 0,
                "total_points": 0,
                "badges": [],
                "level": 1,
                "achievements": [],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            result = await self.collection.insert_one(reward_dict)
            reward_dict["_id"] = result.inserted_id
            return serialize_doc(reward_dict)
        
        return serialize_doc(reward)
    
    async def add_points(self, student_id: str, points: int, reason: str) -> dict:
        """Add points to student's reward"""
        reward = await self.get_or_create_reward(student_id)
        
        new_points = reward["points"] + points
        new_total = reward["total_points"] + points
        new_level = (new_total // 100) + 1  # Level up every 100 points
        
        # Update reward
        result = await self.collection.find_one_and_update(
            {"student_id": student_id},
            {
                "$set": {
                    "points": new_points,
                    "total_points": new_total,
                    "level": new_level,
                    "updated_at": datetime.utcnow().isoformat()
                },
                "$push": {
                    "achievements": {
                        "type": "points",
                        "reason": reason,
                        "points": points,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                }
            },
            return_document=True
        )
        
        return serialize_doc(result)
    
    async def award_badge(self, student_id: str, badge_name: str, reason: str) -> dict:
        """Award badge to student"""
        reward = await self.get_or_create_reward(student_id)
        
        # Check if badge already awarded
        if badge_name in reward.get("badges", []):
            return reward
        
        # Award badge
        result = await self.collection.find_one_and_update(
            {"student_id": student_id},
            {
                "$push": {
                    "badges": badge_name,
                    "achievements": {
                        "type": "badge",
                        "badge": badge_name,
                        "reason": reason,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                },
                "$set": {
                    "updated_at": datetime.utcnow().isoformat()
                }
            },
            return_document=True
        )
        
        # Award points for badge
        await self.add_points(student_id, 50, f"Earned badge: {badge_name}")
        
        return serialize_doc(result)
    
    async def get_student_rewards(self, student_id: str) -> dict:
        """Get student's rewards"""
        return await self.get_or_create_reward(student_id)
    
    async def get_leaderboard(self, limit: int = 10) -> dict:
        """Get leaderboard"""
        cursor = self.collection.find().sort("total_points", -1).limit(limit)
        rewards = await cursor.to_list(length=limit)
        
        # Get student names
        entries = []
        for rank, reward in enumerate(rewards, 1):
            user = await self.users_collection.find_one({"_id": ObjectId(reward["student_id"])})
            entries.append({
                "rank": rank,
                "student_id": reward["student_id"],
                "student_name": user.get("full_name", "Unknown") if user else "Unknown",
                "points": reward["total_points"],
                "level": reward["level"],
                "badges_count": len(reward.get("badges", []))
            })
        
        return {
            "entries": entries,
            "total_students": len(entries)
        }
    
    async def check_and_award_auto_badges(self, student_id: str, event_type: str, data: dict):
        """Automatically check and award badges based on events"""
        reward = await self.get_or_create_reward(student_id)
        
        # First lesson completed
        if event_type == "lesson_completed" and len(reward.get("achievements", [])) == 1:
            await self.award_badge(student_id, "first_steps", "Completed first lesson")
        
        # Perfect score
        if event_type == "assessment_completed" and data.get("score") == 100:
            await self.award_badge(student_id, "perfect_score", "Achieved perfect score")
        
        # Overachiever - 5 assessments above 90%
        if event_type == "assessment_completed":
            high_scores = sum(
                1 for ach in reward.get("achievements", [])
                if ach.get("type") == "assessment" and ach.get("score", 0) > 90
            )
            if high_scores >= 5:
                await self.award_badge(student_id, "overachiever", "Scored above 90% on 5 assessments")


gamification_service = GamificationService()
