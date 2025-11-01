const API_BASE_URL = "https://bput-api.tecosys.ai/api";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "student" | "teacher" | "admin";
  college_name?: string;
  class_grade?: string;
  major_subject?: string;
  phone_number?: string;
  city?: string;
  state?: string;
  learning_preferences?: string[];
  interests?: string[];
  goals?: string;
  profile_picture?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: "beginner" | "intermediate" | "advanced";
  teacher_id: string;
  topics: Topic[];
  created_at: string;
  updated_at: string;
}

export interface Topic {
  title: string;
  description: string;
  difficulty_level: string;
  estimated_duration: number;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  course_id: string;
  topic: string;
  teacher_id: string;
  time_limit: number;
  passing_score: number;
  questions: Question[];
  created_at: string;
}

export interface Question {
  question_text: string;
  question_type: "multiple_choice" | "true_false";
  options?: Option[];
  correct_answer: string;
  points: number;
  explanation?: string;
}

export interface Option {
  text: string;
  is_correct: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

export interface Recommendations {
  user_id: string;
  recommendations: string;
  based_on: {
    class_grade?: string;
    major_subject?: string;
    interests: string[];
    goals?: string;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Request failed");
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: {
    email: string;
    full_name: string;
    password: string;
    role: "student" | "teacher" | "admin";
    college_name?: string;
    class_grade?: string;
    major_subject?: string;
    phone_number?: string;
    city?: string;
    state?: string;
    learning_preferences?: string[];
    interests?: string[];
    goals?: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getRecommendations(): Promise<Recommendations> {
    return this.request<Recommendations>("/auth/recommendations");
  }

  // User management (admin)
  async getUsers(skip = 0, limit = 100): Promise<User[]> {
    return this.request<User[]>(`/users/?skip=${skip}&limit=${limit}`);
  }

  async getUser(userId: string): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}`, {
      method: "DELETE",
    });
  }

  // Courses
  async getCourses(skip = 0, limit = 100): Promise<Course[]> {
    return this.request<Course[]>(`/courses/?skip=${skip}&limit=${limit}`);
  }

  async searchCourses(
    query: string,
    skip = 0,
    limit = 100
  ): Promise<Course[]> {
    return this.request<Course[]>(
      `/courses/search?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`
    );
  }

  async getCourse(courseId: string): Promise<Course> {
    return this.request<Course>(`/courses/${courseId}`);
  }

  async getTeacherCourses(
    teacherId: string,
    skip = 0,
    limit = 100
  ): Promise<Course[]> {
    return this.request<Course[]>(
      `/courses/teacher/${teacherId}?skip=${skip}&limit=${limit}`
    );
  }

  async createCourse(data: {
    title: string;
    description: string;
    category: string;
    difficulty_level: string;
    teacher_id?: string;
    topics: Topic[];
  }): Promise<Course> {
    return this.request<Course>("/courses/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCourse(courseId: string, data: Partial<Course>): Promise<Course> {
    return this.request<Course>(`/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCourse(courseId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/courses/${courseId}`, {
      method: "DELETE",
    });
  }

  // Enrollment
  async enrollInCourse(courseId: string): Promise<any> {
    return this.request<any>(`/courses/${courseId}/enroll`, {
      method: "POST",
    });
  }

  async getEnrollmentStatus(courseId: string): Promise<any> {
    return this.request<any>(`/courses/${courseId}/enrollment`);
  }

  async getMyEnrolledCourses(skip = 0, limit = 100): Promise<Course[]> {
    return this.request<Course[]>(`/courses/enrolled/my-courses?skip=${skip}&limit=${limit}`);
  }

  async unenrollFromCourse(courseId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/courses/${courseId}/unenroll`, {
      method: "DELETE",
    });
  }

  // Assessments
  async getAssessment(assessmentId: string): Promise<Assessment> {
    return this.request<Assessment>(`/assessments/${assessmentId}`);
  }

  async getCourseAssessments(courseId: string): Promise<Assessment[]> {
    return this.request<Assessment[]>(`/assessments/course/${courseId}`);
  }

  async createAssessment(data: {
    title: string;
    description: string;
    course_id: string;
    topic: string;
    teacher_id?: string;
    time_limit: number;
    passing_score: number;
    questions: Question[];
  }): Promise<Assessment> {
    return this.request<Assessment>("/assessments/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async generateQuestions(data: {
    topic: string;
    course_description: string;
    difficulty_level: string;
    num_questions: number;
    question_type: string;
  }): Promise<{ questions: Question[] }> {
    return this.request<{ questions: Question[] }>("/assessments/generate-questions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAssessment(
    assessmentId: string,
    data: Partial<Assessment>
  ): Promise<Assessment> {
    return this.request<Assessment>(`/assessments/${assessmentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAssessment(assessmentId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/assessments/${assessmentId}`, {
      method: "DELETE",
    });
  }

  async submitAssessment(data: {
    assessment_id: string;
    student_id: string;
    answers: Array<{
      question_index: number;
      answer: string;
    }>;
  }): Promise<{
    id: string;
    assessment_id: string;
    student_id: string;
    score: number;
    total_points: number;
    earned_points: number;
    passed: boolean;
    question_results: Array<{
      question_index: number;
      question_text: string;
      student_answer: string;
      correct_answer: string;
      is_correct: boolean;
      points_earned: number;
      ai_feedback: string;
    }>;
    submitted_at: string;
    ai_overall_feedback: string;
  }> {
    return this.request("/assessments/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getStudentResults(studentId: string): Promise<Array<{
    id: string;
    assessment_id: string;
    student_id: string;
    score: number;
    total_points: number;
    earned_points: number;
    passed: boolean;
    question_results: Array<any>;
    submitted_at: string;
    ai_overall_feedback: string;
  }>> {
    return this.request(`/assessments/results/student/${studentId}`);
  }

  async getAssessmentResult(assessmentId: string, studentId: string): Promise<Array<{
    id: string;
    assessment_id: string;
    student_id: string;
    score: number;
    total_points: number;
    earned_points: number;
    passed: boolean;
    question_results: Array<{
      question_index: number;
      question_text: string;
      student_answer: string;
      correct_answer: string;
      is_correct: boolean;
      points_earned: number;
      ai_feedback: string;
    }>;
    submitted_at: string;
    ai_overall_feedback: string;
  }>> {
    return this.request(`/assessments/results/${assessmentId}/student/${studentId}`);
  }

  // Chatbot endpoints
  async chatbotAsk(message: string): Promise<{
    response: string;
    session_id: string;
    timestamp: string;
  }> {
    return this.request("/chatbot/ask", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  async getChatSession(sessionId: string): Promise<{
    id: string;
    student_id: string;
    session_id: string;
    messages: Array<{
      role: string;
      content: string;
      timestamp: string;
    }>;
    created_at: string;
    updated_at: string;
  }> {
    return this.request(`/chatbot/sessions/${sessionId}`);
  }

  async deleteChatSession(sessionId: string): Promise<{ message: string }> {
    return this.request(`/chatbot/sessions/${sessionId}`, {
      method: "DELETE",
    });
  }

  async getStudentChatSessions(studentId: string): Promise<
    Array<{
      id: string;
      session_id: string;
      chat_name: string;
      message_count: number;
      created_at: string;
      updated_at: string;
      preview: string;
    }>
  > {
    return this.request(`/chatbot/sessions/student/${studentId}`);
  }

  async getLearningPath(data: {
    student_id: string;
    level: string;
    subjects: string[];
    weak_areas: string[];
    learning_style: string;
  }): Promise<{
    learning_path: string;
    student_id: string;
  }> {
    return this.request("/chatbot/learning-path", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getFeedback(data: {
    question: string;
    student_answer: string;
    correct_answer: string;
  }): Promise<{
    feedback: string;
  }> {
    return this.request("/chatbot/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async explainConcept(data: {
    concept: string;
    difficulty_level: string;
  }): Promise<{
    concept: string;
    explanation: string;
  }> {
    return this.request("/chatbot/explain", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Adaptive Learning Endpoints
  async getAdaptivePerformance(): Promise<any> {
    return this.request("/analytics/adaptive/performance");
  }

  async getPersonalizedStudyPlan(): Promise<any> {
    return this.request("/analytics/adaptive/study-plan");
  }

  async getAdaptiveHints(question_text: string, difficulty: string): Promise<{ hints: string[] }> {
    return this.request("/analytics/adaptive/hints", {
      method: "POST",
      body: JSON.stringify({ question_text, difficulty }),
    });
  }

  async getAdaptiveFeedback(
    question: Question,
    student_answer: string,
    is_correct: boolean
  ): Promise<{ feedback: string }> {
    return this.request("/analytics/adaptive/feedback", {
      method: "POST",
      body: JSON.stringify({ question, student_answer, is_correct }),
    });
  }

  // Video Courses API methods
  async searchYouTube(
    query: string,
    maxResults: number = 12,
    order: string = "relevance",
    duration?: string
  ): Promise<any> {
    const params = new URLSearchParams({
      q: query,
      max_results: maxResults.toString(),
      order,
    });
    if (duration) params.append("duration", duration);
    
    return this.request(`/youtube/search?${params}`);
  }

  async aiSearchYouTube(
    topic: string,
    userContext?: string,
    maxResults: number = 12
  ): Promise<any> {
    const params = new URLSearchParams({
      max_results: maxResults.toString(),
    });
    
    return this.request(`/youtube/ai-search?${params}`, {
      method: "POST",
      body: JSON.stringify({ topic, user_context: userContext }),
    });
  }

  async generateYouTubeKeywords(
    topic: string,
    userContext?: string
  ): Promise<{ topic: string; keywords: string[]; message: string }> {
    return this.request("/youtube/generate-keywords", {
      method: "POST",
      body: JSON.stringify({ topic, user_context: userContext }),
    });
  }

  async getYouTubeCourseSuggestions(
    topic: string,
    level: string = "beginner"
  ): Promise<any> {
    const params = new URLSearchParams({
      topic,
      level,
    });
    return this.request(`/youtube/course-suggestions?${params}`);
  }

  async getYouTubeChannelInfo(channelId: string): Promise<any> {
    return this.request(`/youtube/channel/${channelId}`);
  }
}

export const api = new ApiClient(API_BASE_URL);
