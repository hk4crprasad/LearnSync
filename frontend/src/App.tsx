import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Navigation from "@/components/Navigation";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Profile from "./pages/Profile";
import Chatbot from "./pages/Chatbot";
import Admin from "./pages/Admin";
import CreateAssessment from "./pages/CreateAssessmentV2";
import CreateCourse from "./pages/CreateCourse";
import TakeAssessment from "./pages/TakeAssessment";
import AssessmentResult from "./pages/AssessmentResult";
import NotFound from "./pages/NotFound";
import RoleDashboard from "./pages/RoleDashboard";
import PracticeAssessment from "./pages/PracticeAssessment";
import AdaptiveLearning from "./pages/AdaptiveLearning";
import Scholarships from "./pages/Scholarships";
import VoiceChat from "./pages/VoiceChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:id"
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-assessment"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                  <CreateAssessment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessments/create"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                  <CreateAssessment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-course"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                  <CreateCourse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/create"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                  <CreateCourse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessments/:id/take"
              element={
                <ProtectedRoute>
                  <TakeAssessment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessment-result/:id"
              element={
                <ProtectedRoute>
                  <AssessmentResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <PracticeAssessment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adaptive-learning"
              element={
                <ProtectedRoute>
                  <AdaptiveLearning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scholarships"
              element={
                <ProtectedRoute>
                  <Scholarships />
                </ProtectedRoute>
              }
            />
            <Route
              path="/voice-chat"
              element={
                <ProtectedRoute>
                  <VoiceChat />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
