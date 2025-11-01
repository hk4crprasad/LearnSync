import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, Course, Recommendations } from "@/lib/api";
import { BookOpen, TrendingUp, Award, Sparkles, Loader2, ArrowRight, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, enrolledData, recsData] = await Promise.all([
          api.getCourses(0, 6),
          api.getMyEnrolledCourses(0, 10).catch(() => []),
          api.getRecommendations().catch(() => null),
        ]);
        setCourses(coursesData);
        setEnrolledCourses(enrolledData);
        setRecommendations(recsData);
      } catch (error: any) {
        toast.error("Failed to load dashboard data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
              Welcome back, {user?.full_name}! 👋
            </h1>
            <p className="text-white/90 text-lg">
              Continue your learning journey
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* AI Practice Quick Action */}
          <Card className="animate-fade-up border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">AI Practice Assessment</h3>
                    <p className="text-sm text-muted-foreground">Generate personalized questions</p>
                  </div>
                </div>
                <Link to="/practice">
                  <Button className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Start Practice
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Adaptive Learning Quick Action */}
          <Card className="animate-fade-up border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Adaptive Learning Plan</h3>
                    <p className="text-sm text-muted-foreground">Get personalized study recommendations</p>
                  </div>
                </div>
                <Link to="/adaptive-learning">
                  <Button variant="outline" className="gap-2 border-blue-500/50">
                    <TrendingUp className="h-4 w-4" />
                    View Plan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Scholarships Quick Action */}
          <Card className="animate-fade-up border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Scholarships</h3>
                    <p className="text-sm text-muted-foreground">Find financial aid opportunities</p>
                  </div>
                </div>
                <Link to="/scholarships">
                  <Button variant="outline" className="gap-2 border-green-500/50">
                    <Award className="h-4 w-4" />
                    Explore
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* YouTube Courses Quick Action */}
          <Card className="animate-fade-up border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-pink-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Youtube className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">YouTube Courses</h3>
                    <p className="text-sm text-muted-foreground">AI-powered video search</p>
                  </div>
                </div>
                <Link to="/youtube-courses">
                  <Button variant="outline" className="gap-2 border-red-500/50">
                    <Youtube className="h-4 w-4" />
                    Discover
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="animate-scale-in border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{enrolledCourses.length}</div>
              <p className="text-xs text-muted-foreground">Active learning paths</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in border-secondary/20 hover:shadow-lg transition-shadow" style={{ animationDelay: "100ms" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">75%</div>
              <p className="text-xs text-muted-foreground">Course completion rate</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in border-accent/20 hover:shadow-lg transition-shadow" style={{ animationDelay: "200ms" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">12</div>
              <p className="text-xs text-muted-foreground">Badges earned</p>
            </CardContent>
          </Card>
        </div>

        {/* My Enrolled Courses */}
        {enrolledCourses.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Enrolled Courses</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course, index) => (
                <Card
                  key={course.id}
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-up group cursor-pointer border-primary/20"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {course.difficulty_level}
                      </Badge>
                      <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md">
                        <BookOpen className="h-3 w-3" />
                        <span className="text-xs font-semibold">Enrolled</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{course.topics?.length || 0} Topics</span>
                        <span>
                          {course.topics?.reduce((acc, t) => acc + t.estimated_duration, 0) || 0} min
                        </span>
                      </div>
                      <Button className="w-full" asChild>
                        <Link to={`/courses/${course.id}`}>
                          Continue Learning
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {recommendations && (
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 animate-fade-up">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>AI-Powered Recommendations</CardTitle>
              </div>
              <CardDescription>
                Personalized course suggestions based on your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-foreground">
                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {recommendations.recommendations.substring(0, 500)}...
                </div>
              </div>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/profile">
                  View Full Recommendations <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Available Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Available Courses</h2>
            <Button variant="outline" asChild>
              <Link to="/courses">View All</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <Card
                key={course.id}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-up group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {course.difficulty_level}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{course.topics?.length || 0} Topics</span>
                      <span>
                        {course.topics?.reduce((acc, t) => acc + t.estimated_duration, 0) || 0} min
                      </span>
                    </div>
                    <Button className="w-full" asChild>
                      <Link to={`/courses/${course.id}`}>
                        Start Learning
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
