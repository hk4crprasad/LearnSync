import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api, Course, Recommendations } from "@/lib/api";
import { BookOpen, TrendingUp, Award, Sparkles, Loader2, ArrowRight, Youtube, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [userQuery, setUserQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load critical data first
        setIsLoading(true);
        const coursesData = await api.getCourses(0, 6);
        setCourses(coursesData);
        setIsLoading(false);
        
        // Load user-specific data in background
        api.getMyEnrolledCourses(0, 10)
          .then(setEnrolledCourses)
          .catch(() => setEnrolledCourses([]));
        
        // Load recommendations last (non-critical)
        api.getRecommendations()
          .then(setRecommendations)
          .catch(() => setRecommendations(null));
          
      } catch (error: any) {
        toast.error(t("dashboard.failed_load"));
        console.error(error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

  // Show welcome dialog when dashboard loads (only first time per user)
  useEffect(() => {
    if (user) {
      // Check if dialog was shown for this user before
      const welcomeShownKey = `welcomeDialogShown_${user.id}`;
      const hasShownDialog = localStorage.getItem(welcomeShownKey);
      
      if (!hasShownDialog) {
        // Small delay to ensure smooth UI transition
        const timer = setTimeout(() => {
          setShowWelcomeDialog(true);
          localStorage.setItem(welcomeShownKey, 'true');
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userQuery.trim()) {
      // Navigate to chatbot with the query
      navigate('/chatbot', { state: { initialQuery: userQuery.trim() } });
      setShowWelcomeDialog(false);
    } else {
      toast.error("Please enter a question!");
    }
  };

  const handleSkip = () => {
    setShowWelcomeDialog(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Dialog */}
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {t("dashboard.dialog_greeting", { name: user?.full_name || "User" })}
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              {t("dashboard.dialog_description")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQuerySubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder={t("dashboard.dialog_placeholder")}
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleSkip}>
                {t("dashboard.dialog_skip")}
              </Button>
              <Button type="submit" className="gap-2">
                <Send className="h-4 w-4" />
                {t("dashboard.dialog_submit")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-fade-up">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {t("dashboard.welcome_back")}, {user?.full_name}! 👋
            </h1>
            <p className="text-white/90 text-lg">
              {t("dashboard.continue_learning")}
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
                    <h3 className="font-semibold text-lg">{t("dashboard.ai_practice")}</h3>
                    <p className="text-sm text-muted-foreground">{t("dashboard.ai_practice_desc")}</p>
                  </div>
                </div>
                <Link to="/practice">
                  <Button className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t("dashboard.start_practice")}
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
                    <h3 className="font-semibold text-lg">{t("dashboard.adaptive_learning")}</h3>
                    <p className="text-sm text-muted-foreground">{t("dashboard.adaptive_learning_desc")}</p>
                  </div>
                </div>
                <Link to="/adaptive-learning">
                  <Button variant="outline" className="gap-2 border-blue-500/50">
                    <TrendingUp className="h-4 w-4" />
                    {t("dashboard.view_plan")}
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
                    <h3 className="font-semibold text-lg">{t("dashboard.scholarships")}</h3>
                    <p className="text-sm text-muted-foreground">{t("dashboard.scholarships_desc")}</p>
                  </div>
                </div>
                <Link to="/scholarships">
                  <Button variant="outline" className="gap-2 border-green-500/50">
                    <Award className="h-4 w-4" />
                    {t("dashboard.explore")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Video Courses Quick Action */}
          <Card className="animate-fade-up border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-pink-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Youtube className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t("dashboard.youtube_courses")}</h3>
                    <p className="text-sm text-muted-foreground">{t("dashboard.youtube_courses_desc")}</p>
                  </div>
                </div>
                <Link to="/youtube-courses">
                  <Button variant="outline" className="gap-2 border-red-500/50">
                    <Youtube className="h-4 w-4" />
                    {t("dashboard.discover")}
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
              <CardTitle className="text-sm font-medium">{t("dashboard.enrolled_courses")}</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{enrolledCourses.length}</div>
              <p className="text-xs text-muted-foreground">{t("dashboard.active_learning_paths")}</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in border-secondary/20 hover:shadow-lg transition-shadow" style={{ animationDelay: "100ms" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.progress")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">75%</div>
              <p className="text-xs text-muted-foreground">{t("dashboard.completion_rate")}</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in border-accent/20 hover:shadow-lg transition-shadow" style={{ animationDelay: "200ms" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.achievements")}</CardTitle>
              <Award className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">12</div>
              <p className="text-xs text-muted-foreground">{t("dashboard.badges_earned")}</p>
            </CardContent>
          </Card>
        </div>

        {/* My Enrolled Courses */}
        {enrolledCourses.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{t("dashboard.my_enrolled_courses")}</h2>
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
                        <span className="text-xs font-semibold">{t("dashboard.enrolled")}</span>
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
                        <span>{course.topics?.length || 0} {t("dashboard.topics")}</span>
                        <span>
                          {course.topics?.reduce((acc, t) => acc + t.estimated_duration, 0) || 0} {t("dashboard.min")}
                        </span>
                      </div>
                      <Button className="w-full" asChild>
                        <Link to={`/courses/${course.id}`}>
                          {t("dashboard.continue_learning")}
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
                <CardTitle>{t("dashboard.ai_recommendations")}</CardTitle>
              </div>
              <CardDescription>
                {t("dashboard.ai_recommendations_desc")}
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
                  {t("dashboard.view_full_recommendations")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Available Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t("dashboard.available_courses")}</h2>
            <Button variant="outline" asChild>
              <Link to="/courses">{t("dashboard.view_all")}</Link>
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
                      <span>{course.topics?.length || 0} {t("dashboard.topics")}</span>
                      <span>
                        {course.topics?.reduce((acc, t) => acc + t.estimated_duration, 0) || 0} {t("dashboard.min")}
                      </span>
                    </div>
                    <Button className="w-full" asChild>
                      <Link to={`/courses/${course.id}`}>
                        {t("dashboard.start_learning")}
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
