# LearnSync - AI-Driven Personalized Learning Platform

## 🎯 Overview
LearnSync is a production-grade FastAPI backend for an AI-powered personalized learning platform designed for students in semi-urban and rural regions. It integrates Azure OpenAI GPT-5-Chat for adaptive learning, real-time feedback, and intelligent recommendations.

## ✨ Features

### Core Modules
1. **Authentication & Authorization**
   - JWT-based secure authentication
   - Role-based access control (Student, Teacher, Admin)
   - Protected endpoints with middleware

2. **User Management**
   - User CRUD operations
   - Role management
   - Profile updates

3. **Course Management**
   - Create, read, update, delete courses
   - Course search functionality
   - Topic organization

4. **Assessment System**
   - Quiz creation and management
   - AI-powered feedback on submissions
   - Real-time grading
   - Performance tracking

5. **Analytics Dashboard**
   - Student progress tracking
   - Learning speed analysis
   - Topic mastery metrics
   - Class-wide analytics for teachers
   - AI-generated recommendations

6. **Gamification**
   - Points system
   - Badge awards
   - Leaderboards
   - Achievements tracking
   - Auto-rewards based on performance

7. **AI Chatbot**
   - GPT-5-Chat powered assistance
   - Academic question answering
   - Concept explanations
   - Session history storage
   - Personalized learning paths

8. **Communication**
   - Messaging between users
   - Session metadata management
   - Announcements
   - Discussion threads

## 🏗️ Architecture

```
LearnSync/
├── app/
│   ├── __init__.py
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth.py              # Authentication middleware
│   ├── models/
│   │   └── __init__.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── users.py             # User management
│   │   ├── courses.py           # Course management
│   │   ├── assessments.py       # Assessment & feedback
│   │   ├── analytics.py         # Progress & analytics
│   │   ├── gamification.py      # Rewards & leaderboards
│   │   ├── chatbot.py           # AI chatbot
│   │   └── communication.py     # Messaging & sessions
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── course.py
│   │   ├── assessment.py
│   │   ├── analytics.py
│   │   ├── gamification.py
│   │   ├── chatbot.py
│   │   └── communication.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── course_service.py
│   │   ├── assessment_service.py
│   │   ├── analytics_service.py
│   │   ├── gamification_service.py
│   │   ├── chatbot_service.py
│   │   └── communication_service.py
│   └── utils/
│       ├── __init__.py
│       ├── database.py          # MongoDB connection
│       ├── ai_client.py         # Azure OpenAI client
│       ├── auth.py              # JWT utilities
│       └── helpers.py           # Helper functions
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── config.py                    # Configuration settings
├── main.py                      # FastAPI application
└── requirements.txt             # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- MongoDB Atlas account
- Azure OpenAI API access

### Installation

1. **Clone the repository**
```bash
cd LearnSync
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Run the application**
```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📚 API Documentation

Once the server is running, access:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/me` - Update current user

### Users
- `GET /api/users/` - Get all users (Admin)
- `GET /api/users/{user_id}` - Get user by ID
- `PUT /api/users/{user_id}` - Update user (Admin)
- `DELETE /api/users/{user_id}` - Delete user (Admin)

### Courses
- `POST /api/courses/` - Create course (Teacher)
- `GET /api/courses/` - Get all courses
- `GET /api/courses/{course_id}` - Get course by ID
- `GET /api/courses/search?q={query}` - Search courses
- `PUT /api/courses/{course_id}` - Update course (Teacher)
- `DELETE /api/courses/{course_id}` - Delete course (Teacher)

### Assessments
- `POST /api/assessments/` - Create assessment (Teacher)
- `GET /api/assessments/course/{course_id}` - Get course assessments
- `GET /api/assessments/{assessment_id}` - Get assessment
- `POST /api/assessments/submit` - Submit assessment
- `GET /api/assessments/results/student/{student_id}` - Get student results

### Analytics
- `POST /api/analytics/progress` - Update progress
- `GET /api/analytics/progress/student/{student_id}` - Get progress
- `GET /api/analytics/student/{student_id}/course/{course_id}` - Get student analytics
- `GET /api/analytics/class/course/{course_id}` - Get class analytics (Teacher)

### Gamification
- `GET /api/rewards/badges` - Get available badges
- `GET /api/rewards/student/{student_id}` - Get student rewards
- `POST /api/rewards/points` - Add points (Teacher)
- `POST /api/rewards/badge` - Award badge (Teacher)
- `GET /api/rewards/leaderboard` - Get leaderboard

### AI Chatbot
- `POST /api/chatbot/ask` - Ask chatbot question
- `GET /api/chatbot/sessions/{session_id}` - Get chat session
- `GET /api/chatbot/sessions/student/{student_id}` - Get student sessions
- `POST /api/chatbot/learning-path` - Generate learning path
- `POST /api/chatbot/explain` - Explain concept

### Communication
- `POST /api/communication/messages` - Send message
- `GET /api/communication/messages` - Get messages
- `POST /api/communication/sessions` - Create session (Teacher)
- `GET /api/communication/sessions/course/{course_id}` - Get course sessions

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Example Login Flow

1. **Register a user**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "securepassword",
    "full_name": "John Doe",
    "role": "student"
  }'
```

2. **Login**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "securepassword"
  }'
```

3. **Use the token**
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <your_token_here>"
```

## 🤖 AI Features

### Azure OpenAI Integration
- **Model**: GPT-5-Chat
- **Capabilities**:
  - Personalized learning path generation
  - Real-time assessment feedback
  - Concept explanations
  - Next topic suggestions
  - Chatbot conversations

### Chat Session Storage
All chatbot interactions are stored in MongoDB with:
- User ID
- Session ID
- Message history
- Timestamps
- AI responses

## 🗄️ Database Collections

- `users` - User accounts and profiles
- `courses` - Course information
- `assessments` - Quiz and assessment data
- `results` - Assessment submissions and scores
- `progress` - Student progress tracking
- `rewards` - Gamification data
- `messages` - User communications
- `sessions` - Live/recorded session metadata
- `chat_sessions` - Chatbot conversation history

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation with Pydantic
- CORS middleware
- Secure environment variable management

## 📊 Testing

Use the Swagger UI at `/api/docs` to test all endpoints interactively.

Example test flow:
1. Register a teacher and a student
2. Login as teacher and create a course
3. Create an assessment for the course
4. Login as student and submit the assessment
5. View AI-generated feedback
6. Check progress and analytics
7. Interact with the chatbot

## 🚀 Deployment

### Environment Variables for Production
Update `.env` with production values:
- Generate a strong `SECRET_KEY`
- Set `DEBUG=False`
- Configure proper CORS origins
- Use production MongoDB URI

### Running in Production
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Or use Gunicorn with Uvicorn workers:
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 📝 License

This project is developed for educational purposes.

## 👨‍💻 Support

For issues and questions, refer to the API documentation at `/api/docs`.

---

**Built with ❤️ using FastAPI, MongoDB, and Azure OpenAI**
