# 🤖 AI Chatbot Usage Guide

## Quick Start

The chatbot now automatically handles session management and student identification!

## ✨ New Features

### 1. **Auto-Generated Session IDs**
- First chat automatically creates a new session with UUID
- No need to manually provide `session_id` for new conversations
- Session ID returned in response for continuing the conversation

### 2. **Auto-Filled Student ID**
- System automatically uses your logged-in user ID
- No need to manually provide `student_id`
- Works seamlessly with authentication

## 📝 Usage Examples

### First Chat (New Session)
```json
POST /api/chatbot/ask
Authorization: Bearer YOUR_TOKEN

{
  "message": "What is Python?"
}
```

**Response:**
```json
{
  "response": "Python is a high-level programming language...",
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": "2025-10-26T14:45:00.123456"
}
```

### Continue Conversation (Existing Session)
```json
POST /api/chatbot/ask
Authorization: Bearer YOUR_TOKEN

{
  "message": "Can you give me an example?",
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Generate Learning Path (Simplified)
```json
POST /api/chatbot/learning-path
Authorization: Bearer YOUR_TOKEN

{
  "level": "Beginner",
  "subjects": ["Python", "Data Science"],
  "weak_areas": ["Loops"],
  "learning_style": "Visual"
}
```
*(No need to provide `student_id` - it's automatic!)*

### Explain a Concept
```json
POST /api/chatbot/explain
Authorization: Bearer YOUR_TOKEN

{
  "concept": "Object-Oriented Programming",
  "difficulty_level": "medium"
}
```

## 🔄 Conversation Flow

1. **Start New Chat**
   - Send message without `session_id`
   - System creates new session automatically
   - Returns `session_id` in response

2. **Continue Chat**
   - Use the `session_id` from previous response
   - AI remembers context from earlier messages
   - Full conversation history maintained

3. **Multiple Sessions**
   - Start new topic = new session (omit `session_id`)
   - Each session is independent
   - View all your sessions: `GET /api/chatbot/sessions/student/{student_id}`

## 📚 Available Endpoints

### 1. Ask Chatbot
```
POST /api/chatbot/ask
```
- **Body**: `{ "message": "your question" }`
- **Optional**: `session_id` (auto-generated if omitted)
- **Returns**: AI response with session_id

### 2. Get Chat Session
```
GET /api/chatbot/sessions/{session_id}
```
- View complete conversation history
- See all messages with timestamps

### 3. Get All Sessions
```
GET /api/chatbot/sessions/student/{student_id}
```
- List all your chat sessions
- Sorted by most recent

### 4. Delete Session
```
DELETE /api/chatbot/sessions/{session_id}
```
- Remove chat history
- Start fresh

### 5. Generate Learning Path
```
POST /api/chatbot/learning-path
```
- Get personalized course recommendations
- Based on your profile and preferences

### 6. Explain Concept
```
POST /api/chatbot/explain
```
- Get AI explanation of any concept
- Adjustable difficulty level

### 7. Generate Feedback
```
POST /api/chatbot/feedback
```
- Get AI feedback on answers
- Compare student vs correct answers

## 💡 Pro Tips

### 1. Context-Aware Conversations
The AI remembers your:
- Previous messages in the session
- Your user profile (grade, interests, goals)
- Learning preferences

**Example:**
```
You: "I'm struggling with calculus"
AI: "As a 12th-grade science student preparing for JEE, let me help..."

You: "Can you explain derivatives?"
AI: "Building on our calculus discussion, derivatives are..."
```

### 2. Session Management
- Keep `session_id` for related questions
- Start new session for different topics
- Delete old sessions to clean up

### 3. Better Questions Get Better Answers
```
❌ Bad: "help"
✅ Good: "Can you explain how loops work in Python with examples?"

❌ Bad: "math"
✅ Good: "I'm preparing for JEE. What calculus topics should I focus on first?"
```

## 🎯 Real-World Examples

### Example 1: Study Help
```bash
# First question
curl -X POST "http://localhost:6765/api/chatbot/ask" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain Newton'\''s laws of motion"}'

# Follow-up (use session_id from response)
curl -X POST "http://localhost:6765/api/chatbot/ask" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Give me a real-world example of the third law",
    "session_id": "YOUR_SESSION_ID"
  }'
```

### Example 2: Learning Path
```bash
curl -X POST "http://localhost:6765/api/chatbot/learning-path" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "Intermediate",
    "subjects": ["Machine Learning", "Python"],
    "weak_areas": ["Statistics", "Linear Algebra"],
    "learning_style": "Project-based"
  }'
```

### Example 3: Concept Explanation
```bash
curl -X POST "http://localhost:6765/api/chatbot/explain" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "concept": "Recursion in Programming",
    "difficulty_level": "beginner"
  }'
```

## 🔐 Authentication

All chatbot endpoints require authentication:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Get your token from:
- Registration: `POST /api/auth/register`
- Login: `POST /api/auth/login`

## 🎓 Personalization

The chatbot uses your profile to provide better responses:
- **Class/Grade**: Adjusts explanation complexity
- **Major Subject**: Focuses on relevant topics
- **Interests**: Provides related examples
- **Goals**: Aligns advice with your objectives
- **Learning Style**: Matches teaching approach

## 📊 Session Data

Each session stores:
- `session_id`: Unique identifier
- `student_id`: Your user ID
- `messages`: Complete conversation history
- `created_at`: When session started
- `updated_at`: Last message time

## 🚀 Quick Test via Swagger UI

1. Go to http://localhost:6765/api/docs
2. Authorize with your token
3. Expand `/api/chatbot/ask`
4. Click "Try it out"
5. Enter just: `{"message": "Hello!"}`
6. Execute
7. See auto-generated session_id in response!

---

**Built with Azure OpenAI GPT-5-Chat** 🤖✨
