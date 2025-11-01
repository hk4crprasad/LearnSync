import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, Course, Assessment } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Clock, BookOpen, CheckCircle2, FileText, Copy, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [courseData, assessmentData] = await Promise.all([
          api.getCourse(id),
          api.getCourseAssessments(id).catch(() => []),
        ]);
        setCourse(courseData);
        setAssessments(assessmentData);
      } catch (error: any) {
        toast.error("Failed to load course details");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!id) return;
      
      try {
        setCheckingEnrollment(true);
        await api.getEnrollmentStatus(id);
        setIsEnrolled(true);
      } catch (error) {
        // Not enrolled (404 error is expected)
        setIsEnrolled(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkEnrollment();
  }, [id]);

  const handleCopyCourseId = () => {
    if (id) {
      navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success("Course ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEnroll = async () => {
    if (!id) return;
    
    try {
      setIsEnrolling(true);
      await api.enrollInCourse(id);
      setIsEnrolled(true);
      toast.success("Successfully enrolled in course!");
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll in course");
      console.error(error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!id) return;
    
    try {
      setIsEnrolling(true);
      await api.unenrollFromCourse(id);
      setIsEnrolled(false);
      toast.success("Successfully unenrolled from course");
    } catch (error: any) {
      toast.error(error.message || "Failed to unenroll from course");
      console.error(error);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Button asChild>
            <Link to="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalDuration = course.topics?.reduce((acc, t) => acc + t.estimated_duration, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-12">
          <Button variant="ghost" asChild className="text-white hover:bg-white/10 mb-6">
            <Link to="/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
          
          <div className="animate-fade-up">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {course.difficulty_level}
              </Badge>
              <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                {course.category}
              </Badge>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-white/90 text-lg mb-6 max-w-3xl">
              {course.description}
            </p>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>{course.topics?.length || 0} Topics</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{totalDuration} minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-fade-up">
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {course.topics?.length || 0} topics to master in this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {course.topics?.map((topic, index) => (
                    <AccordionItem key={index} value={`topic-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold">{topic.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {topic.estimated_duration} min · {topic.difficulty_level}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-11 pt-2">
                          <p className="text-muted-foreground">{topic.description}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Assessments */}
            <Card className="animate-fade-up" style={{ animationDelay: "100ms" }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Assessments</CardTitle>
                    <CardDescription>
                      {assessments.length > 0 
                        ? `Test your knowledge with ${assessments.length} assessment${assessments.length > 1 ? 's' : ''}`
                        : 'No assessments yet'}
                    </CardDescription>
                  </div>
                  {(user?.role === "teacher" || user?.role === "admin") && (
                    <Button size="sm" asChild variant="outline">
                      <Link to={`/assessments/create?courseId=${id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Create Assessment
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {assessments.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No assessments available yet</p>
                    {(user?.role === "teacher" || user?.role === "admin") && (
                      <Button size="sm" className="mt-4" asChild>
                        <Link to={`/assessments/create?courseId=${id}`}>
                          Create First Assessment
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  assessments.map((assessment) => (
                    <Card key={assessment.id} className="border-2 hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{assessment.title}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {assessment.description}
                            </CardDescription>
                          </div>
                          <FileText className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span>{assessment.questions.length} questions</span>
                            <span>{assessment.time_limit / 60} min</span>
                          </div>
                          <Badge variant="secondary">{assessment.passing_score}% to pass</Badge>
                        </div>
                        <Button className="w-full" size="sm" asChild>
                          <Link to={`/assessments/${assessment.id}/take`}>
                            Take Assessment
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6 animate-scale-in">
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-sm text-muted-foreground">Level</span>
                    <Badge variant="secondary">{course.difficulty_level}</Badge>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-sm text-muted-foreground">Topics</span>
                    <span className="font-semibold">{course.topics?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="font-semibold">{totalDuration} min</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="font-semibold">{course.category}</span>
                  </div>
                </div>
                
                {checkingEnrollment ? (
                  <Button className="w-full" size="lg" disabled>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Checking...
                  </Button>
                ) : isEnrolled ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">Enrolled</span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                      onClick={handleUnenroll}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Unenrolling...
                        </>
                      ) : (
                        "Unenroll"
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Enrolling...
                      </>
                    ) : (
                      "Enroll Now"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="animate-scale-in" style={{ animationDelay: "50ms" }}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Share Course</CardTitle>
                </div>
                <CardDescription>Share this Course ID with others</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="share-course-id" className="text-sm">
                  Course ID
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="share-course-id"
                    value={id || ""}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyCourseId}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with this ID can access this course
                </p>
              </CardContent>
            </Card>

            <Card className="animate-scale-in" style={{ animationDelay: "100ms" }}>
              <CardHeader>
                <CardTitle className="text-lg">What you'll learn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {course.topics?.slice(0, 4).map((topic, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{topic.title}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
