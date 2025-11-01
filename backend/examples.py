"""
LearnSync API Test Examples

This file contains example requests for testing the API endpoints.
"""

# ============================================
# 1. AUTHENTICATION EXAMPLES
# ============================================

# Register a new student
REGISTER_STUDENT = {
    "email": "student@example.com",
    "password": "SecurePass123!",
    "full_name": "John Student",
    "role": "student"
}

# Register a teacher
REGISTER_TEACHER = {
    "email": "teacher@example.com",
    "password": "TeacherPass123!",
    "full_name": "Jane Teacher",
    "role": "teacher"
}

# Login
LOGIN_REQUEST = {
    "email": "student@example.com",
    "password": "SecurePass123!"
}

# ============================================
# 2. COURSE EXAMPLES
# ============================================

# Create a course
CREATE_COURSE = {
    "title": "Introduction to Python Programming",
    "description": "Learn Python from basics to advanced concepts",
    "category": "Programming",
    "difficulty_level": "beginner",
    "teacher_id": "teacher_id_here",
    "topics": [
        {
            "title": "Python Basics",
            "description": "Variables, data types, and operators",
            "difficulty_level": "beginner",
            "estimated_duration": 60
        },
        {
            "title": "Control Flow",
            "description": "If statements, loops, and functions",
            "difficulty_level": "beginner",
            "estimated_duration": 90
        }
    ]
}

# ============================================
# 3. ASSESSMENT EXAMPLES
# ============================================

# Create an assessment
CREATE_ASSESSMENT = {
    "title": "Python Basics Quiz",
    "description": "Test your knowledge of Python fundamentals",
    "course_id": "course_id_here",
    "topic": "Python Basics",
    "teacher_id": "teacher_id_here",
    "time_limit": 30,
    "passing_score": 70.0,
    "questions": [
        {
            "question_text": "What is the correct way to declare a variable in Python?",
            "question_type": "multiple_choice",
            "options": [
                {"text": "var x = 5", "is_correct": False},
                {"text": "x = 5", "is_correct": True},
                {"text": "int x = 5", "is_correct": False},
                {"text": "declare x = 5", "is_correct": False}
            ],
            "correct_answer": "x = 5",
            "points": 10,
            "explanation": "Python uses simple assignment without type declaration"
        },
        {
            "question_text": "Is Python case-sensitive?",
            "question_type": "true_false",
            "options": [
                {"text": "True", "is_correct": True},
                {"text": "False", "is_correct": False}
            ],
            "correct_answer": "True",
            "points": 5
        }
    ]
}

# Submit assessment
SUBMIT_ASSESSMENT = {
    "assessment_id": "assessment_id_here",
    "student_id": "student_id_here",
    "answers": [
        {
            "question_index": 0,
            "answer": "x = 5"
        },
        {
            "question_index": 1,
            "answer": "True"
        }
    ]
}

# ============================================
# 4. CHATBOT EXAMPLES
# ============================================

# Ask chatbot a question
CHATBOT_REQUEST = {
    "message": "Can you explain what variables are in programming?",
    "student_id": "student_id_here",
    "session_id": None  # Will create new session
}

# Generate learning path
LEARNING_PATH_REQUEST = {
    "student_id": "student_id_here",
    "level": "Beginner",
    "subjects": ["Python", "Web Development"],
    "weak_areas": ["Loops", "Functions"],
    "learning_style": "Visual"
}

# Explain concept
EXPLAIN_CONCEPT = {
    "concept": "Object-Oriented Programming",
    "difficulty_level": "medium"
}

# ============================================
# 5. GAMIFICATION EXAMPLES
# ============================================

# Add points to student
ADD_POINTS = {
    "student_id": "student_id_here",
    "points": 50,
    "reason": "Completed first assessment with excellent score"
}

# Award badge
AWARD_BADGE = {
    "student_id": "student_id_here",
    "badge_name": "perfect_score",
    "reason": "Achieved 100% on Python Basics Quiz"
}

# ============================================
# 6. COMMUNICATION EXAMPLES
# ============================================

# Send message
SEND_MESSAGE = {
    "sender_id": "teacher_id_here",
    "receiver_id": "student_id_here",
    "subject": "Great work on the quiz!",
    "content": "I'm impressed with your progress. Keep up the good work!",
    "message_type": "direct"
}

# Create session
CREATE_SESSION = {
    "title": "Python Basics - Live Coding Session",
    "description": "Interactive coding session covering loops and functions",
    "course_id": "course_id_here",
    "teacher_id": "teacher_id_here",
    "session_type": "live",
    "scheduled_time": "2024-01-15T10:00:00",
    "duration": 60,
    "materials": ["slides.pdf", "code_examples.py"]
}

# ============================================
# 7. ANALYTICS EXAMPLES
# ============================================

# Update progress
UPDATE_PROGRESS = {
    "completed_topics": ["Python Basics", "Control Flow"],
    "current_topic": "Data Structures",
    "total_time_spent": 180,
    "completion_percentage": 40.0
}
