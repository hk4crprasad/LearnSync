"""
Enhanced Registration Examples with Personalization

The registration now supports detailed personalization for better AI-driven recommendations.
"""

# ============================================
# STUDENT REGISTRATION EXAMPLES
# ============================================

# Example 1: High School Student
REGISTER_HIGH_SCHOOL_STUDENT = {
    "email": "rajesh.kumar@example.com",
    "password": "SecurePass123!",
    "full_name": "Rajesh Kumar",
    "role": "student",
    
    # Personalization fields
    "college_name": "Delhi Public School",
    "class_grade": "12th Grade",
    "major_subject": "Science - PCM (Physics, Chemistry, Math)",
    "phone_number": "+91-9876543210",
    "city": "Bangalore",
    "state": "Karnataka",
    "learning_preferences": ["Visual", "Hands-on", "Problem-solving"],
    "interests": ["Mathematics", "Physics", "Programming", "Robotics"],
    "goals": "Preparing for JEE and want to excel in competitive exams. Interested in engineering."
}

# Example 2: College Undergraduate Student
REGISTER_COLLEGE_STUDENT = {
    "email": "priya.sharma@college.edu",
    "password": "CollegePass456!",
    "full_name": "Priya Sharma",
    "role": "student",
    
    "college_name": "National Institute of Technology",
    "class_grade": "Undergraduate - 2nd Year",
    "major_subject": "Computer Science Engineering",
    "phone_number": "+91-9123456789",
    "city": "Pune",
    "state": "Maharashtra",
    "learning_preferences": ["Reading", "Project-based", "Video tutorials"],
    "interests": ["Machine Learning", "Web Development", "Data Science", "AI"],
    "goals": "Master full-stack development and machine learning. Build real-world projects for portfolio."
}

# Example 3: Rural Area Student
REGISTER_RURAL_STUDENT = {
    "email": "amit.patel@gmail.com",
    "password": "RuralLearn789!",
    "full_name": "Amit Patel",
    "role": "student",
    
    "college_name": "Government Senior Secondary School",
    "class_grade": "10th Grade",
    "major_subject": "General Studies",
    "phone_number": "+91-9988776655",
    "city": "Kheda",
    "state": "Gujarat",
    "learning_preferences": ["Visual", "Step-by-step guides", "Practice exercises"],
    "interests": ["Mathematics", "Science", "English", "Computer basics"],
    "goals": "Score well in board exams and learn computer skills for better career opportunities."
}

# Example 4: Commerce Student
REGISTER_COMMERCE_STUDENT = {
    "email": "sneha.reddy@example.com",
    "password": "Commerce2024!",
    "full_name": "Sneha Reddy",
    "role": "student",
    
    "college_name": "Christ University",
    "class_grade": "11th Grade",
    "major_subject": "Commerce with Computer Applications",
    "phone_number": "+91-8877665544",
    "city": "Hyderabad",
    "state": "Telangana",
    "learning_preferences": ["Reading", "Case studies", "Real-world examples"],
    "interests": ["Accounting", "Business Studies", "Economics", "Excel"],
    "goals": "Prepare for CA foundation and develop strong accounting skills."
}

# Example 5: Arts/Humanities Student
REGISTER_ARTS_STUDENT = {
    "email": "kavya.iyer@example.com",
    "password": "ArtsPass321!",
    "full_name": "Kavya Iyer",
    "role": "student",
    
    "college_name": "Loyola College",
    "class_grade": "Undergraduate - 1st Year",
    "major_subject": "Psychology with Sociology",
    "phone_number": "+91-7766554433",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "learning_preferences": ["Reading", "Discussion-based", "Research"],
    "interests": ["Psychology", "Human Behavior", "Research Methods", "Counseling"],
    "goals": "Understand human psychology deeply and pursue a career in counseling or research."
}

# ============================================
# TEACHER REGISTRATION EXAMPLES
# ============================================

REGISTER_TEACHER = {
    "email": "dr.verma@school.edu",
    "password": "TeacherPass999!",
    "full_name": "Dr. Anita Verma",
    "role": "teacher",
    
    "college_name": "Delhi Public School",
    "class_grade": "Teaching Grades 9-12",
    "major_subject": "Mathematics and Physics",
    "phone_number": "+91-9900887766",
    "city": "Mumbai",
    "state": "Maharashtra",
    "learning_preferences": ["Interactive teaching", "Problem-solving approach"],
    "interests": ["Advanced Mathematics", "STEM Education", "Educational Technology"],
    "goals": "Help students excel in competitive exams and make learning engaging through technology."
}

# ============================================
# MINIMAL REGISTRATION (Required fields only)
# ============================================

REGISTER_MINIMAL = {
    "email": "simple@example.com",
    "password": "SimplePass123!",
    "full_name": "Simple User",
    "role": "student"
    # All other fields are optional
}

# ============================================
# UPDATE PROFILE EXAMPLE
# ============================================

UPDATE_PROFILE = {
    "college_name": "Updated College Name",
    "class_grade": "12th Grade",
    "interests": ["New Interest 1", "New Interest 2"],
    "goals": "Updated learning goals and aspirations"
}

# ============================================
# API USAGE EXAMPLES
# ============================================

"""
1. Register with full personalization:
   POST /api/auth/register
   Body: REGISTER_HIGH_SCHOOL_STUDENT
   
   Response will include a personalized welcome message!

2. Get personalized recommendations:
   GET /api/auth/recommendations
   Headers: Authorization: Bearer <token>
   
   Returns AI-generated course recommendations based on:
   - Your class/grade level
   - Your major subject
   - Your interests
   - Your learning goals

3. Update your profile:
   PUT /api/auth/me
   Headers: Authorization: Bearer <token>
   Body: UPDATE_PROFILE

4. Ask AI for personalized learning path:
   POST /api/chatbot/learning-path
   Body: {
     "student_id": "your_id",
     "level": "Intermediate",
     "subjects": ["Math", "Physics"],
     "weak_areas": ["Calculus"],
     "learning_style": "Visual"
   }
"""

# ============================================
# BENEFITS OF PERSONALIZATION
# ============================================

"""
With detailed profile information, the AI can:

1. Generate personalized welcome messages
2. Recommend relevant courses and topics
3. Adjust difficulty levels appropriately
4. Suggest learning paths aligned with goals
5. Provide context-aware chatbot responses
6. Create customized study plans
7. Match students with relevant resources
8. Track progress against personal goals
9. Offer location-specific opportunities
10. Connect students with similar interests

The more information you provide, the better the AI can personalize your learning experience!
"""
