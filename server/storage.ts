import {
  UserModel,
  CourseModel,
  LessonModel,
  AssessmentModel,
  QuestionModel,
  StudentProgressModel,
  AssessmentSubmissionModel,
  EnrollmentModel,
  BadgeModel,
  UserBadgeModel,
  MessageModel,
  ChatHistoryModel,
  type User,
  type InsertUser,
  type Course,
  type InsertCourse,
  type Lesson,
  type InsertLesson,
  type Assessment,
  type InsertAssessment,
  type Question,
  type InsertQuestion,
  type StudentProgress,
  type InsertStudentProgress,
  type AssessmentSubmission,
  type InsertAssessmentSubmission,
  type Enrollment,
  type InsertEnrollment,
  type Badge,
  type InsertBadge,
  type UserBadge,
  type InsertUserBadge,
  type Message,
  type InsertMessage,
  type ChatHistory,
  type InsertChatHistory,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: string, pointsToAdd: number): Promise<void>;
  updateUserStreak(userId: string, streak: number): Promise<void>;

  // Course operations
  getCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | undefined>;
  getCoursesByInstructor(instructorId: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<void>;
  deleteCourse(id: string): Promise<void>;

  // Lesson operations
  getLessonsByCourse(courseId: string): Promise<Lesson[]>;
  getLessonById(id: string): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<void>;

  // Assessment operations
  getAssessmentsByCourse(courseId: string): Promise<Assessment[]>;
  getAssessmentById(id: string): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;

  // Question operations
  getQuestionsByAssessment(assessmentId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;

  // Enrollment operations
  getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]>;
  getEnrollmentByCourseAndStudent(courseId: string, studentId: string): Promise<Enrollment | undefined>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  completeEnrollment(id: string): Promise<void>;

  // Progress operations
  getProgressByStudent(studentId: string, courseId: string): Promise<StudentProgress[]>;
  getProgressByLesson(studentId: string, lessonId: string): Promise<StudentProgress | undefined>;
  createProgress(progress: InsertStudentProgress): Promise<StudentProgress>;
  updateProgress(id: string, progress: Partial<InsertStudentProgress>): Promise<void>;

  // Submission operations
  getSubmissionsByStudent(studentId: string): Promise<AssessmentSubmission[]>;
  getSubmissionById(id: string): Promise<AssessmentSubmission | undefined>;
  createSubmission(submission: InsertAssessmentSubmission): Promise<AssessmentSubmission>;

  // Badge operations
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userBadge: InsertUserBadge): Promise<UserBadge>;

  // Message operations
  getMessagesByUser(userId: string): Promise<Message[]>;
  getMessageById(id: string): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<void>;

  // Chat history operations
  getChatHistoryByStudent(studentId: string): Promise<ChatHistory | undefined>;
  createChatHistory(chatHistory: InsertChatHistory): Promise<ChatHistory>;
  updateChatHistory(id: string, messages: any): Promise<void>;

  // Analytics operations
  getLeaderboard(limit?: number): Promise<User[]>;
  getStudentStats(studentId: string): Promise<any>;
  getTeacherStats(instructorId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id).lean();
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username }).lean();
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email }).lean();
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = await UserModel.create(insertUser);
    return user.toObject();
  }

  async updateUserPoints(userId: string, pointsToAdd: number): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { $inc: { points: pointsToAdd } });
  }

  async updateUserStreak(userId: string, streak: number): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { currentStreak: streak });
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return await CourseModel.find().sort({ createdAt: -1 }).lean();
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    const course = await CourseModel.findById(id).lean();
    return course || undefined;
  }

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    return await CourseModel.find({ instructorId }).lean();
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const newCourse = await CourseModel.create(course);
    return newCourse.toObject();
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<void> {
    await CourseModel.findByIdAndUpdate(id, course);
  }

  async deleteCourse(id: string): Promise<void> {
    await CourseModel.findByIdAndDelete(id);
    // Cascade deletes
    await LessonModel.deleteMany({ courseId: id });
    await AssessmentModel.deleteMany({ courseId: id });
    await StudentProgressModel.deleteMany({ courseId: id });
    await EnrollmentModel.deleteMany({ courseId: id });
  }

  // Lesson operations
  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    return await LessonModel.find({ courseId }).sort({ order: 1 }).lean();
  }

  async getLessonById(id: string): Promise<Lesson | undefined> {
    const lesson = await LessonModel.findById(id).lean();
    return lesson || undefined;
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const newLesson = await LessonModel.create(lesson);
    return newLesson.toObject();
  }

  async updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<void> {
    await LessonModel.findByIdAndUpdate(id, lesson);
  }

  // Assessment operations
  async getAssessmentsByCourse(courseId: string): Promise<Assessment[]> {
    return await AssessmentModel.find({ courseId }).lean();
  }

  async getAssessmentById(id: string): Promise<Assessment | undefined> {
    const assessment = await AssessmentModel.findById(id).lean();
    return assessment || undefined;
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const newAssessment = await AssessmentModel.create(assessment);
    return newAssessment.toObject();
  }

  // Question operations
  async getQuestionsByAssessment(assessmentId: string): Promise<Question[]> {
    return await QuestionModel.find({ assessmentId }).lean();
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const newQuestion = await QuestionModel.create(question);
    return newQuestion.toObject();
  }

  // Enrollment operations
  async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    return await EnrollmentModel.find({ studentId }).lean();
  }

  async getEnrollmentByCourseAndStudent(courseId: string, studentId: string): Promise<Enrollment | undefined> {
    const enrollment = await EnrollmentModel.findOne({ courseId, studentId }).lean();
    return enrollment || undefined;
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const newEnrollment = await EnrollmentModel.create(enrollment);
    return newEnrollment.toObject();
  }

  async completeEnrollment(id: string): Promise<void> {
    await EnrollmentModel.findByIdAndUpdate(id, { completedAt: new Date() });
  }

  // Progress operations
  async getProgressByStudent(studentId: string, courseId: string): Promise<StudentProgress[]> {
    return await StudentProgressModel.find({ studentId, courseId }).lean();
  }

  async getProgressByLesson(studentId: string, lessonId: string): Promise<StudentProgress | undefined> {
    const progress = await StudentProgressModel.findOne({ studentId, lessonId }).lean();
    return progress || undefined;
  }

  async createProgress(progress: InsertStudentProgress): Promise<StudentProgress> {
    const newProgress = await StudentProgressModel.create(progress);
    return newProgress.toObject();
  }

  async updateProgress(id: string, progress: Partial<InsertStudentProgress>): Promise<void> {
    await StudentProgressModel.findByIdAndUpdate(id, progress);
  }

  // Submission operations
  async getSubmissionsByStudent(studentId: string): Promise<AssessmentSubmission[]> {
    return await AssessmentSubmissionModel.find({ studentId }).sort({ submittedAt: -1 }).lean();
  }

  async getSubmissionById(id: string): Promise<AssessmentSubmission | undefined> {
    const submission = await AssessmentSubmissionModel.findById(id).lean();
    return submission || undefined;
  }

  async createSubmission(submission: InsertAssessmentSubmission): Promise<AssessmentSubmission> {
    const newSubmission = await AssessmentSubmissionModel.create(submission);
    return newSubmission.toObject();
  }

  // Badge operations
  async getAllBadges(): Promise<Badge[]> {
    return await BadgeModel.find().lean();
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return await UserBadgeModel.find({ userId }).lean();
  }

  async awardBadge(userBadge: InsertUserBadge): Promise<UserBadge> {
    const newBadge = await UserBadgeModel.create(userBadge);
    return newBadge.toObject();
  }

  // Message operations
  async getMessagesByUser(userId: string): Promise<Message[]> {
    return await MessageModel.find({
      $or: [{ senderId: userId }, { recipientId: userId }]
    }).sort({ sentAt: -1 }).lean();
  }

  async getMessageById(id: string): Promise<Message | undefined> {
    const message = await MessageModel.findById(id).lean();
    return message || undefined;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const newMessage = await MessageModel.create(message);
    return newMessage.toObject();
  }

  async markMessageAsRead(id: string): Promise<void> {
    await MessageModel.findByIdAndUpdate(id, { read: true });
  }

  // Chat history operations
  async getChatHistoryByStudent(studentId: string): Promise<ChatHistory | undefined> {
    const history = await ChatHistoryModel.findOne({ studentId }).sort({ updatedAt: -1 }).lean();
    return history || undefined;
  }

  async createChatHistory(history: InsertChatHistory): Promise<ChatHistory> {
    const newHistory = await ChatHistoryModel.create(history);
    return newHistory.toObject();
  }

  async updateChatHistory(id: string, newMessages: any): Promise<void> {
    await ChatHistoryModel.findByIdAndUpdate(id, {
      messages: newMessages,
      updatedAt: new Date()
    });
  }

  // Analytics operations
  async getLeaderboard(limit: number = 100): Promise<User[]> {
    return await UserModel.find({ role: "student" }).sort({ points: -1 }).limit(limit).lean();
  }

  async getStudentStats(studentId: string): Promise<any> {
    const userEnrollments = await this.getEnrollmentsByStudent(studentId);
    const submissions = await this.getSubmissionsByStudent(studentId);
    const userBadgesList = await this.getUserBadges(studentId);

    return {
      coursesEnrolled: userEnrollments.length,
      coursesCompleted: userEnrollments.filter((e) => e.completedAt).length,
      totalSubmissions: submissions.length,
      averageScore: submissions.length > 0
        ? submissions.reduce((sum, s) => sum + (s.score / s.maxScore) * 100, 0) / submissions.length
        : 0,
      badgesEarned: userBadgesList.length,
    };
  }

  async getTeacherStats(instructorId: string): Promise<any> {
    const instructorCourses = await this.getCoursesByInstructor(instructorId);
    const courseIds = instructorCourses.map((c) => (c as any)._id?.toString() || c.id);

    let totalStudents = 0;

    for (const courseId of courseIds) {
      const courseEnrollments = await EnrollmentModel.find({ courseId }).lean();
      totalStudents += courseEnrollments.length;
    }

    return {
      totalStudents,
      activeCourses: instructorCourses.length,
      totalSubmissions: 0,
      avgCompletion: 0,
    };
  }
}

export const storage = new DatabaseStorage();
