import { useEffect, useState } from "react";
import { api, Course } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, BookOpen, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Courses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseIdInput, setCourseIdInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await api.getCourses(0, 50);
      setCourses(data);
    } catch (error: any) {
      toast.error(t("courses.failed_load"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCourses();
      return;
    }

    try {
      setIsSearching(true);
      const data = await api.searchCourses(searchQuery);
      setCourses(data);
    } catch (error: any) {
      toast.error(t("courses.search_failed"));
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinByCourseId = async () => {
    if (!courseIdInput.trim()) {
      toast.error(t("courses.enter_course_id_error"));
      return;
    }

    try {
      setIsJoining(true);
      // Validate that the course exists by fetching it
      await api.getCourse(courseIdInput.trim());
      // Navigate to the course detail page
      navigate(`/courses/${courseIdInput.trim()}`);
    } catch (error: any) {
      toast.error(t("courses.course_not_found"));
      console.error(error);
    } finally {
      setIsJoining(false);
    }
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
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-8 w-8" />
              <h1 className="text-3xl sm:text-4xl font-bold">{t("courses.title")}</h1>
            </div>
            <p className="text-white/90 text-lg">
              {t("courses.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Join by ID */}
        <div className="mb-8 space-y-4 animate-fade-up">
          {/* Search Bar */}
          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("courses.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : t("courses.search")}
            </Button>
          </div>

          {/* Join by Course ID */}
          <Card className="max-w-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{t("courses.have_course_id")}</CardTitle>
              </div>
              <CardDescription className="text-sm">
                {t("courses.course_id_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder={t("courses.enter_course_id")}
                  value={courseIdInput}
                  onChange={(e) => setCourseIdInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleJoinByCourseId()}
                  className="flex-1 font-mono"
                />
                <Button onClick={handleJoinByCourseId} disabled={isJoining}>
                  {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : t("courses.access_course")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t("courses.no_courses_found")}</h3>
            <p className="text-muted-foreground">
              {t("courses.no_courses_desc")}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <Card
                key={course.id}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-up group cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant={
                        course.difficulty_level === "beginner"
                          ? "secondary"
                          : course.difficulty_level === "intermediate"
                          ? "default"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {course.difficulty_level}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {course.topics && course.topics.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{t("courses.topics_covered")}</p>
                        <div className="flex flex-wrap gap-1">
                          {course.topics.slice(0, 3).map((topic, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {topic.title}
                            </Badge>
                          ))}
                          {course.topics.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{course.topics.length - 3} {t("courses.more")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                      <span>{course.topics?.length || 0} {t("dashboard.topics")}</span>
                      <span>
                        {course.topics?.reduce((acc, t) => acc + t.estimated_duration, 0) || 0} {t("dashboard.min")}
                      </span>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <Link to={`/courses/${course.id}`}>{t("courses.view_course")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
