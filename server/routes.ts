import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertCourseSchema, insertLessonSchema, insertAssessmentSchema, insertQuestionSchema } from "@shared/schema";
import OpenAI from "openai";

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key-change-in-production";

// Initialize Azure OpenAI with provided credentials
const openai = new OpenAI({
  apiKey: "AN3B455O036BdBPJxNF5mWNHuj1TknSXzZZUovcGmIUyfsc6SQUTJQQJ99BJACYeBjFXJ3w3AAAAACOGtQ0D",
  baseURL: "https://tecos.cognitiveservices.azure.com/openai/deployments/gpt-4.1",
  defaultQuery: { "api-version": "2024-02-15-preview" },
  defaultHeaders: { 
    "api-key": "AN3B455O036BdBPJxNF5mWNHuj1TknSXzZZUovcGmIUyfsc6SQUTJQQJ99BJACYeBjFXJ3w3AAAAACOGtQ0D"
  },
});

// Middleware to verify JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// Middleware to check user role
function authorizeRole(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res, next) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      next(error);
    }
  });

  // Course routes
  app.get("/api/courses", authenticateToken, async (req, res, next) => {
    try {
      const allCourses = await storage.getCourses();
      
      // Add instructor names and enrollment info
      const coursesWithDetails = await Promise.all(
        allCourses.map(async (course) => {
          const instructor = await storage.getUser(course.instructorId);
          const enrollment = await storage.getEnrollmentByCourseAndStudent(
            course.id,
            req.user.id
          );
          
          return {
            ...course,
            instructorName: instructor?.fullName || "Unknown",
            progress: enrollment ? 50 : 0, // Simplified progress
          };
        })
      );

      res.json(coursesWithDetails);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/courses/:id", authenticateToken, async (req, res, next) => {
    try {
      const course = await storage.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const instructor = await storage.getUser(course.instructorId);
      res.json({
        ...course,
        instructorName: instructor?.fullName || "Unknown",
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/courses", authenticateToken, authorizeRole("teacher", "admin"), async (req, res, next) => {
    try {
      const data = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(data);
      res.json(course);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/courses/:id/enroll", authenticateToken, authorizeRole("student"), async (req, res, next) => {
    try {
      const existing = await storage.getEnrollmentByCourseAndStudent(
        req.params.id,
        req.user.id
      );
      
      if (existing) {
        return res.status(400).json({ message: "Already enrolled" });
      }

      const enrollment = await storage.createEnrollment({
        studentId: req.user.id,
        courseId: req.params.id,
      });

      res.json(enrollment);
    } catch (error) {
      next(error);
    }
  });

  // Lesson routes
  app.get("/api/courses/:courseId/lessons", authenticateToken, async (req, res, next) => {
    try {
      const lessons = await storage.getLessonsByCourse(req.params.courseId);
      
      // Check completion status for each lesson
      const lessonsWithProgress = await Promise.all(
        lessons.map(async (lesson) => {
          const progress = await storage.getProgressByLesson(req.user.id, lesson.id);
          return {
            ...lesson,
            completed: progress?.completed || false,
          };
        })
      );

      res.json(lessonsWithProgress);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/courses/:courseId/lessons/:lessonId", authenticateToken, async (req, res, next) => {
    try {
      const lesson = await storage.getLessonById(req.params.lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const progress = await storage.getProgressByLesson(req.user.id, lesson.id);
      res.json({
        ...lesson,
        completed: progress?.completed || false,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/lessons/:lessonId/complete", authenticateToken, authorizeRole("student"), async (req, res, next) => {
    try {
      const lesson = await storage.getLessonById(req.params.lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      let progress = await storage.getProgressByLesson(req.user.id, req.params.lessonId);
      
      if (!progress) {
        progress = await storage.createProgress({
          studentId: req.user.id,
          courseId: lesson.courseId,
          lessonId: req.params.lessonId,
          completed: true,
          progressPercentage: 100,
        });
      } else {
        await storage.updateProgress(progress.id, { completed: true, progressPercentage: 100 });
      }

      // Award points for completing lesson
      await storage.updateUserPoints(req.user.id, 10);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Assessment routes
  app.get("/api/assessments/:id", authenticateToken, async (req, res, next) => {
    try {
      const assessment = await storage.getAssessmentById(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/assessments/:id/questions", authenticateToken, async (req, res, next) => {
    try {
      const questions = await storage.getQuestionsByAssessment(req.params.id);
      // Remove correct answers from the response
      const questionsWithoutAnswers = questions.map(({ correctAnswer, ...q }) => q);
      res.json(questionsWithoutAnswers);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/assessments/:id/submit", authenticateToken, authorizeRole("student"), async (req, res, next) => {
    try {
      const { answers } = req.body;
      const assessment = await storage.getAssessmentById(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      const questions = await storage.getQuestionsByAssessment(req.params.id);
      
      let score = 0;
      let maxScore = 0;
      const weakAreas: string[] = [];

      questions.forEach((q, index) => {
        maxScore += q.points;
        if (answers[index] === q.correctAnswer) {
          score += q.points;
        } else {
          weakAreas.push(q.question.substring(0, 50));
        }
      });

      // Generate AI feedback if OpenAI is configured
      let aiFeedback = "";
      let recommendations: string[] = [];

      if (process.env.OPENAI_API_KEY) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "You are an educational AI tutor providing personalized feedback to students.",
              },
              {
                role: "user",
                content: `A student scored ${score}/${maxScore} on an assessment. They struggled with: ${weakAreas.join(", ")}. Provide encouraging feedback and 3 specific recommendations for improvement.`,
              },
            ],
            max_tokens: 300,
          });

          aiFeedback = completion.choices[0]?.message?.content || "";
          
          // Extract recommendations (simplified)
          recommendations = [
            "Review the topics where you lost points",
            "Practice more problems in these areas",
            "Ask your teacher for additional resources",
          ];
        } catch (err) {
          console.error("OpenAI API error:", err);
          aiFeedback = "Great effort! Keep practicing to improve your score.";
        }
      }

      const submission = await storage.createSubmission({
        studentId: req.user.id,
        assessmentId: req.params.id,
        answers,
        score,
        maxScore,
        aiFeedback,
        weakAreas,
        recommendations,
      });

      // Award points for completing assessment
      const pointsToAward = score >= (assessment.passingScore * maxScore) / 100 ? 50 : 25;
      await storage.updateUserPoints(req.user.id, pointsToAward);

      res.json({ submissionId: submission.id, score, maxScore });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/assessments/:assessmentId/submissions/:submissionId", authenticateToken, async (req, res, next) => {
    try {
      const submission = await storage.getSubmissionById(req.params.submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      const assessment = await storage.getAssessmentById(submission.assessmentId);
      
      res.json({
        ...submission,
        passingScore: assessment?.passingScore || 70,
        courseId: assessment?.courseId,
      });
    } catch (error) {
      next(error);
    }
  });

  // Student-specific routes
  app.get("/api/student/stats", authenticateToken, authorizeRole("student"), async (req, res, next) => {
    try {
      const stats = await storage.getStudentStats(req.user.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/student/courses", authenticateToken, authorizeRole("student"), async (req, res, next) => {
    try {
      const enrollments = await storage.getEnrollmentsByStudent(req.user.id);
      const courses = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = await storage.getCourseById(enrollment.courseId);
          return {
            ...course,
            progress: 50, // Simplified
            enrolledAt: enrollment.enrolledAt,
          };
        })
      );
      res.json(courses);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/student/enrolled-course-ids", authenticateToken, authorizeRole("student"), async (req, res, next) => {
    try {
      const enrollments = await storage.getEnrollmentsByStudent(req.user.id);
      const courseIds = enrollments.map((e) => e.courseId);
      res.json(courseIds);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/student/assessments/upcoming", authenticateToken, authorizeRole("student"), async (req, res, next) => {
    try {
      res.json([]); // Simplified - return empty for now
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/student/activity", authenticateToken, authorizeRole("student"), async (req, res, next) => {
    try {
      res.json([]); // Simplified
    } catch (error) {
      next(error);
    }
  });

  // Teacher-specific routes
  app.get("/api/teacher/stats", authenticateToken, authorizeRole("teacher"), async (req, res, next) => {
    try {
      const stats = await storage.getTeacherStats(req.user.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/teacher/classes", authenticateToken, authorizeRole("teacher"), async (req, res, next) => {
    try {
      const courses = await storage.getCoursesByInstructor(req.user.id);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  });

  // Leaderboard route
  app.get("/api/leaderboard", authenticateToken, async (req, res, next) => {
    try {
      const leaderboard = await storage.getLeaderboard(50);
      const usersWithoutPasswords = leaderboard.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      next(error);
    }
  });

  // Messages routes
  app.get("/api/messages", authenticateToken, async (req, res, next) => {
    try {
      const messages = await storage.getMessagesByUser(req.user.id);
      
      const messagesWithDetails = await Promise.all(
        messages.map(async (msg) => {
          const sender = await storage.getUser(msg.senderId);
          const recipient = await storage.getUser(msg.recipientId);
          return {
            ...msg,
            senderName: sender?.fullName || "Unknown",
            senderAvatar: sender?.avatar,
            recipientName: recipient?.fullName || "Unknown",
          };
        })
      );

      res.json(messagesWithDetails);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/messages", authenticateToken, async (req, res, next) => {
    try {
      const { recipientId, subject, content } = req.body;
      const message = await storage.createMessage({
        senderId: req.user.id,
        recipientId,
        subject,
        content,
      });
      res.json(message);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/messages/:id/read", authenticateToken, async (req, res, next) => {
    try {
      await storage.markMessageAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/contacts", authenticateToken, async (req, res, next) => {
    try {
      // Return all teachers for students, all students for teachers
      const allUsers = await storage.getLeaderboard(1000);
      const contacts = allUsers.filter((u) => {
        if (req.user.role === "student") {
          return u.role === "teacher";
        }
        return u.role === "student";
      });

      const contactsWithoutPasswords = contacts.map(({ password, ...user }) => user);
      res.json(contactsWithoutPasswords);
    } catch (error) {
      next(error);
    }
  });

  // AI Chatbot route
  app.post("/api/chatbot", authenticateToken, authorizeRole("student"), async (req, res, next) => {
    try {
      const { message } = req.body;

      // Get or create chat history
      let history = await storage.getChatHistoryByStudent(req.user.id);
      let messages: any[] = history?.messages || [];

      messages.push({
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });

      // Call OpenAI API with gpt-4.1
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI tutor. Provide clear, encouraging educational guidance to students.",
          },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 500,
      });

      const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

      messages.push({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      });

      // Save chat history
      if (history) {
        await storage.updateChatHistory((history as any)._id || (history as any).id, messages);
      } else {
        await storage.createChatHistory({
          studentId: req.user.id,
          messages,
        });
      }

      res.json({ response: aiResponse });
    } catch (error) {
      console.error("Chatbot error:", error);
      next(error);
    }
  });

  // Enrollment status route
  app.get("/api/courses/:courseId/enrollment", authenticateToken, async (req, res, next) => {
    try {
      const enrollment = await storage.getEnrollmentByCourseAndStudent(
        req.params.courseId,
        req.user.id
      );
      
      if (!enrollment) {
        return res.json(null);
      }

      const lessons = await storage.getLessonsByCourse(req.params.courseId);
      const progress = await storage.getProgressByStudent(req.user.id, req.params.courseId);
      const completedLessons = progress.filter((p) => p.completed).length;

      res.json({
        ...enrollment,
        progress: lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0,
        completedLessons,
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
