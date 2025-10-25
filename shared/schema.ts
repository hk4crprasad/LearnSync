import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

// User Schema
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "student" | "teacher" | "admin";
  fullName: string;
  avatar?: string;
  points: number;
  currentStreak: number;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
  fullName: { type: String, required: true },
  avatar: { type: String },
  points: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<IUser>("User", userSchema);

// Course Schema
export interface ICourse extends Document {
  title: string;
  description: string;
  thumbnail?: string;
  instructorId: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  category: string;
  createdAt: Date;
}

const courseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String },
  instructorId: { type: String, required: true, ref: "User" },
  difficulty: { type: String, required: true },
  duration: { type: Number, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const CourseModel = mongoose.model<ICourse>("Course", courseSchema);

// Lesson Schema
export interface ILesson extends Document {
  courseId: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  estimatedMinutes: number;
  createdAt: Date;
}

const lessonSchema = new Schema<ILesson>({
  courseId: { type: String, required: true, ref: "Course" },
  title: { type: String, required: true },
  content: { type: String, required: true },
  videoUrl: { type: String },
  order: { type: Number, required: true },
  estimatedMinutes: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const LessonModel = mongoose.model<ILesson>("Lesson", lessonSchema);

// Assessment Schema
export interface IAssessment extends Document {
  courseId: string;
  lessonId?: string;
  title: string;
  type: "quiz" | "test" | "assignment";
  passingScore: number;
  createdAt: Date;
}

const assessmentSchema = new Schema<IAssessment>({
  courseId: { type: String, required: true, ref: "Course" },
  lessonId: { type: String, ref: "Lesson" },
  title: { type: String, required: true },
  type: { type: String, required: true },
  passingScore: { type: Number, default: 70 },
  createdAt: { type: Date, default: Date.now },
});

export const AssessmentModel = mongoose.model<IAssessment>("Assessment", assessmentSchema);

// Question Schema
export interface IQuestion extends Document {
  assessmentId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

const questionSchema = new Schema<IQuestion>({
  assessmentId: { type: String, required: true, ref: "Assessment" },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
  points: { type: Number, default: 1 },
});

export const QuestionModel = mongoose.model<IQuestion>("Question", questionSchema);

// Student Progress Schema
export interface IStudentProgress extends Document {
  studentId: string;
  courseId: string;
  lessonId?: string;
  completed: boolean;
  progressPercentage: number;
  lastAccessedAt: Date;
}

const studentProgressSchema = new Schema<IStudentProgress>({
  studentId: { type: String, required: true, ref: "User" },
  courseId: { type: String, required: true, ref: "Course" },
  lessonId: { type: String, ref: "Lesson" },
  completed: { type: Boolean, default: false },
  progressPercentage: { type: Number, default: 0 },
  lastAccessedAt: { type: Date, default: Date.now },
});

export const StudentProgressModel = mongoose.model<IStudentProgress>("StudentProgress", studentProgressSchema);

// Assessment Submission Schema
export interface IAssessmentSubmission extends Document {
  studentId: string;
  assessmentId: string;
  answers: number[];
  score: number;
  maxScore: number;
  aiFeedback?: string;
  weakAreas?: string[];
  recommendations?: string[];
  submittedAt: Date;
}

const assessmentSubmissionSchema = new Schema<IAssessmentSubmission>({
  studentId: { type: String, required: true, ref: "User" },
  assessmentId: { type: String, required: true, ref: "Assessment" },
  answers: { type: [Number], required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  aiFeedback: { type: String },
  weakAreas: { type: [String] },
  recommendations: { type: [String] },
  submittedAt: { type: Date, default: Date.now },
});

export const AssessmentSubmissionModel = mongoose.model<IAssessmentSubmission>("AssessmentSubmission", assessmentSubmissionSchema);

// Enrollment Schema
export interface IEnrollment extends Document {
  studentId: string;
  courseId: string;
  enrolledAt: Date;
  completedAt?: Date;
}

const enrollmentSchema = new Schema<IEnrollment>({
  studentId: { type: String, required: true, ref: "User" },
  courseId: { type: String, required: true, ref: "Course" },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export const EnrollmentModel = mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);

// Badge Schema
export interface IBadge extends Document {
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

const badgeSchema = new Schema<IBadge>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  criteria: { type: String, required: true },
});

export const BadgeModel = mongoose.model<IBadge>("Badge", badgeSchema);

// User Badge Schema
export interface IUserBadge extends Document {
  userId: string;
  badgeId: string;
  earnedAt: Date;
}

const userBadgeSchema = new Schema<IUserBadge>({
  userId: { type: String, required: true, ref: "User" },
  badgeId: { type: String, required: true, ref: "Badge" },
  earnedAt: { type: Date, default: Date.now },
});

export const UserBadgeModel = mongoose.model<IUserBadge>("UserBadge", userBadgeSchema);

// Message Schema
export interface IMessage extends Document {
  senderId: string;
  recipientId: string;
  subject: string;
  content: string;
  read: boolean;
  sentAt: Date;
}

const messageSchema = new Schema<IMessage>({
  senderId: { type: String, required: true, ref: "User" },
  recipientId: { type: String, required: true, ref: "User" },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
});

export const MessageModel = mongoose.model<IMessage>("Message", messageSchema);

// Chat History Schema
export interface IChatHistory extends Document {
  studentId: string;
  messages: Array<{ role: string; content: string; timestamp: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const chatHistorySchema = new Schema<IChatHistory>({
  studentId: { type: String, required: true, ref: "User" },
  messages: { type: [{ role: String, content: String, timestamp: String }], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const ChatHistoryModel = mongoose.model<IChatHistory>("ChatHistory", chatHistorySchema);

// Zod Insert Schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['student', 'teacher', 'admin']).default('student'),
  fullName: z.string().min(1),
  avatar: z.string().optional(),
  points: z.number().default(0),
  currentStreak: z.number().default(0),
});

export const insertCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  thumbnail: z.string().optional(),
  instructorId: z.string(),
  difficulty: z.string(),
  duration: z.number(),
  category: z.string(),
});

export const insertLessonSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  videoUrl: z.string().optional(),
  order: z.number(),
  estimatedMinutes: z.number(),
});

export const insertAssessmentSchema = z.object({
  courseId: z.string(),
  lessonId: z.string().optional(),
  title: z.string().min(1),
  type: z.string(),
  passingScore: z.number().default(70),
});

export const insertQuestionSchema = z.object({
  assessmentId: z.string(),
  question: z.string().min(1),
  options: z.array(z.string()),
  correctAnswer: z.number(),
  explanation: z.string().optional(),
  points: z.number().default(1),
});

export const insertStudentProgressSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  lessonId: z.string().optional(),
  completed: z.boolean().default(false),
  progressPercentage: z.number().default(0),
});

export const insertAssessmentSubmissionSchema = z.object({
  studentId: z.string(),
  assessmentId: z.string(),
  answers: z.array(z.number()),
  score: z.number(),
  maxScore: z.number(),
  aiFeedback: z.string().optional(),
  weakAreas: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
});

export const insertEnrollmentSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
});

export const insertBadgeSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  criteria: z.string().min(1),
});

export const insertUserBadgeSchema = z.object({
  userId: z.string(),
  badgeId: z.string(),
});

export const insertMessageSchema = z.object({
  senderId: z.string(),
  recipientId: z.string(),
  subject: z.string().min(1),
  content: z.string().min(1),
});

export const insertChatHistorySchema = z.object({
  studentId: z.string(),
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
    timestamp: z.string(),
  })),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = IUser;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = ICourse;

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = ILesson;

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = IAssessment;

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = IQuestion;

export type InsertStudentProgress = z.infer<typeof insertStudentProgressSchema>;
export type StudentProgress = IStudentProgress;

export type InsertAssessmentSubmission = z.infer<typeof insertAssessmentSubmissionSchema>;
export type AssessmentSubmission = IAssessmentSubmission;

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = IEnrollment;

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = IBadge;

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = IUserBadge;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = IMessage;

export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;
export type ChatHistory = IChatHistory;

