import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Dashboard from "./Dashboard";
import TeacherDashboard from "./TeacherDashboard";
import Admin from "./Admin";

const RoleDashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route to appropriate dashboard based on role
  switch (user.role) {
    case "admin":
      return <Admin />;
    case "teacher":
      return <TeacherDashboard />;
    case "student":
    default:
      return <Dashboard />;
  }
};

export default RoleDashboard;
