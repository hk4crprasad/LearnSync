from datetime import datetime
from bson import ObjectId
from app.utils.database import get_users_collection
from app.utils.auth import get_password_hash, verify_password
from app.schemas.user import UserCreate, UserUpdate
from app.utils.helpers import serialize_doc
from app.utils.ai_client import ai_client
from typing import Optional


class UserService:
    def __init__(self):
        self.collection = get_users_collection()
    
    async def create_user(self, user_data: UserCreate) -> dict:
        """Create a new user with personalization"""
        # Check if user already exists
        existing_user = await self.collection.find_one({"email": user_data.email})
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user document
        user_dict = {
            "email": user_data.email,
            "full_name": user_data.full_name,
            "role": user_data.role,
            "hashed_password": hashed_password,
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            # Personalization fields
            "college_name": user_data.college_name,
            "class_grade": user_data.class_grade,
            "major_subject": user_data.major_subject,
            "phone_number": user_data.phone_number,
            "city": user_data.city,
            "state": user_data.state,
            "learning_preferences": user_data.learning_preferences or [],
            "interests": user_data.interests or [],
            "goals": user_data.goals,
            "profile_picture": user_data.profile_picture,
        }
        
        result = await self.collection.insert_one(user_dict)
        user_dict["_id"] = result.inserted_id
        
        # Generate personalized welcome message and recommendations if student
        if user_data.role == "student":
            welcome_message = await self._generate_welcome_message(user_dict)
            user_dict["welcome_message"] = welcome_message
        
        return serialize_doc(user_dict)
    
    async def _generate_welcome_message(self, user_data: dict) -> str:
        """Generate personalized welcome message using AI"""
        prompt = f"""
        Create a warm, encouraging welcome message for a new student with the following profile:
        
        Name: {user_data.get('full_name')}
        College: {user_data.get('college_name', 'Not specified')}
        Class/Grade: {user_data.get('class_grade', 'Not specified')}
        Major: {user_data.get('major_subject', 'Not specified')}
        Interests: {', '.join(user_data.get('interests', [])) or 'Not specified'}
        Learning Goals: {user_data.get('goals', 'Not specified')}
        
        The message should:
        1. Welcome them personally
        2. Acknowledge their background and interests
        3. Provide motivation based on their goals
        4. Keep it concise (2-3 sentences)
        """
        
        try:
            return ai_client.generate_response(
                prompt,
                system_prompt="You are a friendly educational advisor creating personalized welcome messages."
            )
        except:
            return f"Welcome to LearnSync, {user_data.get('full_name')}! We're excited to support your learning journey."
    
    async def get_personalized_recommendations(self, user_id: str) -> dict:
        """Get AI-powered personalized course recommendations"""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        prompt = f"""
        Based on this student profile, recommend 5 relevant courses or topics:
        
        Class/Grade: {user.get('class_grade', 'Not specified')}
        Major: {user.get('major_subject', 'Not specified')}
        Interests: {', '.join(user.get('interests', [])) or 'Not specified'}
        Learning Goals: {user.get('goals', 'Not specified')}
        
        Provide specific, actionable course recommendations with brief descriptions.
        """
        
        recommendations = ai_client.generate_response(
            prompt,
            system_prompt="You are an educational advisor recommending courses based on student profiles."
        )
        
        return {
            "user_id": user_id,
            "recommendations": recommendations,
            "based_on": {
                "class_grade": user.get('class_grade'),
                "major_subject": user.get('major_subject'),
                "interests": user.get('interests'),
                "goals": user.get('goals')
            }
        }
    
    async def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get user by email"""
        user = await self.collection.find_one({"email": email})
        return serialize_doc(user) if user else None
    
    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Get user by ID"""
        user = await self.collection.find_one({"_id": ObjectId(user_id)})
        return serialize_doc(user) if user else None
    
    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[dict]:
        """Update user"""
        update_data = {k: v for k, v in user_data.model_dump(exclude_unset=True).items()}
        
        if not update_data:
            return await self.get_user_by_id(user_id)
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": update_data},
            return_document=True
        )
        
        return serialize_doc(result) if result else None
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        result = await self.collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    
    async def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        """Authenticate user"""
        user = await self.collection.find_one({"email": email})
        
        if not user:
            return None
        
        if not verify_password(password, user["hashed_password"]):
            return None
        
        return serialize_doc(user)
    
    async def get_all_users(self, skip: int = 0, limit: int = 100) -> list:
        """Get all users"""
        cursor = self.collection.find().skip(skip).limit(limit)
        users = await cursor.to_list(length=limit)
        return [serialize_doc(user) for user in users]


user_service = UserService()
