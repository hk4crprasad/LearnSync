import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, Course, Assessment } from "@/lib/api";
import { BookOpen, FileText, Users, PlusCircle, Loader2, ArrowRight, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses created by this teacher
        const coursesData = await api.getCourses(0, 100);
        // Filter courses by teacher_id
        const teacherCourses = coursesData.filter((course) => course.teacher_id === user?.id);
        setCourses(teacherCourses);

        // Fetch assessments
        const assessmentsData = await api.getAssessments().catch(() => []);
        setAssessments(assessmentsData);
      } catch (error: any) {
        toast.error("Failed to load teacher dashboard data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-fade-up">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Welcome back, {user?.full_name}! 📚
            </h1>
            <p className="text-white/90 text-lg">
              Manage your courses and track student progress
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="animate-scale-in border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{courses.length}</div>
              <p className="text-xs text-muted-foreground">Active courses</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in border-secondary/20 hover:shadow-lg transition-shadow" style={{ animationDelay: "100ms" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assessments</CardTitle>
              <FileText className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{assessments.length}</div>
              <p className="text-xs text-muted-foreground">Created assessments</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in border-accent/20 hover:shadow-lg transition-shadow" style={{ animationDelay: "200ms" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">-</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in border-orange-500/20 hover:shadow-lg transition-shadow" style={{ animationDelay: "300ms" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">View</div>
              <p className="text-xs text-muted-foreground">Student performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 animate-fade-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Create new content for your students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/courses/create">
                <Button className="w-full" size="lg">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Create New Course
                </Button>
              </Link>
              <Link to="/assessments/create">
                <Button className="w-full" size="lg" variant="secondary">
                  <FileText className="mr-2 h-5 w-5" />
                  Create Assessment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* My Courses */}
        <Card className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  My Courses
                </CardTitle>
                <CardDescription>Courses you've created</CardDescription>
              </div>
              <Link to="/courses">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first course to start teaching
                </p>
                <Link to="/courses/create">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Course
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.slice(0, 6).map((course, index) => (
                  <Card
                    key={course.id}
                    className="group hover:shadow-lg transition-all duration-300 animate-scale-in cursor-pointer border-2 hover:border-primary/50"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={
                          course.difficulty_level === "beginner" ? "default" :
                          course.difficulty_level === "intermediate" ? "secondary" : "destructive"
                        }>
                          {course.difficulty_level}
                        </Badge>
                        <Badge variant="outline">{course.category}</Badge>
                      </div>
                      <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link to={`/courses/${course.id}`}>
                        <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          Manage Course
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Assessments */}
        <Card className="mt-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-secondary" />
                  Recent Assessments
                </CardTitle>
                <CardDescription>Track student performance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {assessments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No assessments yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create assessments to evaluate your students
                </p>
                <Link to="/assessments/create">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Assessment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.slice(0, 5).map((assessment, index) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors animate-fade-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{assessment.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {assessment.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{assessment.topic}</Badge>
                        <Badge variant="secondary">{assessment.questions.length} questions</Badge>
                      </div>
                    </div>
                    <Link to={`/assessments/${assessment.id}`}>
                      <Button variant="ghost" size="sm">
                        View <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
