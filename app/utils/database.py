from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
from config import settings
from typing import Optional

class Database:
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB Atlas"""
        if cls.client is None:
            cls.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                server_api=ServerApi('1')
            )
            print("✅ Connected to MongoDB Atlas!")
        
    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            cls.client = None
            print("❌ MongoDB connection closed!")
    
    @classmethod
    def get_database(cls):
        """Get database instance"""
        if cls.client is None:
            # Initialize connection synchronously for first access
            cls.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                server_api=ServerApi('1')
            )
        return cls.client[settings.DATABASE_NAME]
    
    @classmethod
    def get_collection(cls, collection_name: str):
        """Get a specific collection"""
        db = cls.get_database()
        return db[collection_name]


# Database instance
db = Database()


# Collection getters
def get_users_collection():
    return db.get_collection("users")

def get_courses_collection():
    return db.get_collection("courses")

def get_assessments_collection():
    return db.get_collection("assessments")

def get_results_collection():
    return db.get_collection("results")

def get_progress_collection():
    return db.get_collection("progress")

def get_rewards_collection():
    return db.get_collection("rewards")

def get_messages_collection():
    return db.get_collection("messages")

def get_sessions_collection():
    return db.get_collection("sessions")

def get_chat_sessions_collection():
    return db.get_collection("chat_sessions")
