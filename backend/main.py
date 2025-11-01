from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.utils.database import db
from app.routes import auth, users, courses, assessments, analytics, gamification, chatbot, communication, voice, youtube
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown"""
    # Startup
    await db.connect_db()
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} started!")
    
    yield
    
    # Shutdown
    await db.close_db()
    print(f"👋 {settings.APP_NAME} shutdown complete!")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Driven Personalized Learning Platform Backend",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(assessments.router)
app.include_router(analytics.router)
app.include_router(gamification.router)
app.include_router(chatbot.router)
app.include_router(communication.router)
app.include_router(voice.router)  # Voice assistant - no auth required
app.include_router(youtube.router)  # YouTube integration


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
        "redoc": "/api/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=6765,
        reload=settings.DEBUG
    )
