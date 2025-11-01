# LearnSync API - Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Copy `.env.example` to `.env` and configure your settings:
```bash
cp .env.example .env
```

The `.env` file is already configured with the provided credentials.

### 3. Start the Server

**Option A: Using the startup script (Linux/Mac)**
```bash
chmod +x start.sh
./start.sh
```

**Option B: Using the startup script (Windows)**
```batch
start.bat
```

**Option C: Direct Python**
```bash
python main.py
```

**Option D: Using Uvicorn**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Access the API

- **API Documentation (Swagger)**: http://localhost:8000/api/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/api/redoc
- **Root Endpoint**: http://localhost:8000/
- **Health Check**: http://localhost:8000/health

## Quick Test Flow

### 1. Register Users

**Register a Teacher:**
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.com",
    "password": "Teacher123!",
    "full_name": "Ms. Sarah Johnson",
    "role": "teacher"
  }'
```

**Register a Student:**
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@school.com",
    "password": "Student123!",
    "full_name": "Alex Kumar",
    "role": "student"
  }'
```

### 2. Login and Get Token

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.com",
    "password": "Teacher123!"
  }'
```

Save the `access_token` from the response.

### 3. Create a Course (as Teacher)

```bash
curl -X POST "http://localhost:8000/api/courses/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python for Beginners",
    "description": "Learn Python programming from scratch",
    "category": "Programming",
    "difficulty_level": "beginner",
    "topics": [
      {
        "title": "Introduction to Python",
        "description": "Basic concepts and syntax",
        "difficulty_level": "beginner",
        "estimated_duration": 45
      }
    ]
  }'
```

### 4. Test the AI Chatbot (as Student)

```bash
curl -X POST "http://localhost:8000/api/chatbot/ask" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is Python and why should I learn it?",
    "student_id": "YOUR_STUDENT_ID"
  }'
```

### 5. Check Leaderboard

```bash
curl -X GET "http://localhost:8000/api/rewards/leaderboard" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Using Swagger UI (Recommended)

1. Open http://localhost:8000/api/docs in your browser
2. Click "Authorize" button at the top right
3. Login via `/api/auth/login` to get your token
4. Enter `Bearer YOUR_TOKEN` in the authorization dialog
5. Test any endpoint interactively!

## Key Features to Test

### ✅ Authentication
- Register different user types (student, teacher, admin)
- Login and receive JWT token
- Access protected endpoints

### ✅ AI-Powered Learning
- Ask the chatbot questions
- Get personalized learning paths
- Receive AI-generated feedback on assessments

### ✅ Assessments
- Create quizzes (as teacher)
- Submit answers (as student)
- View detailed AI feedback

### ✅ Gamification
- Earn points for completing tasks
- Unlock badges
- View leaderboard rankings

### ✅ Analytics
- Track student progress
- View learning speed and mastery
- Get AI recommendations for next topics

### ✅ Communication
- Send messages between users
- Create session metadata
- Manage live/recorded sessions

## Database Collections

The following MongoDB collections will be automatically created:
- `users` - User accounts
- `courses` - Course data
- `assessments` - Quizzes and questions
- `results` - Assessment submissions
- `progress` - Learning progress
- `rewards` - Points and badges
- `messages` - User communications
- `sessions` - Session metadata
- `chat_sessions` - Chatbot conversations

## Troubleshooting

### Port already in use
Change the port in `main.py` or run:
```bash
uvicorn main:app --reload --port 8001
```

### MongoDB connection issues
Verify your `MONGODB_URI` in `.env` is correct.

### Import errors
Ensure all dependencies are installed:
```bash
pip install -r requirements.txt
```

## Architecture Overview

```
Request → FastAPI Routes → Middleware (Auth) → Services → Database
                                    ↓
                            Azure OpenAI (AI Features)
```

## Next Steps

1. Explore the API documentation at `/api/docs`
2. Test all endpoints using Swagger UI
3. Check the `examples.py` file for more request examples
4. Review the `README.md` for detailed documentation

---

**Happy Learning! 🎓**
