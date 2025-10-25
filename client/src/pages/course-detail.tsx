import { useRoute, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Clock,
  User,
  PlayCircle,
  CheckCircle,
  Lock,
  Award,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CourseDetail() {
  const [, params] = useRoute("/courses/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const courseId = params?.id;

  const { data: course, isLoading } = useQuery({
    queryKey: ["/api/courses", courseId],
  });

  const { data: lessons } = useQuery({
    queryKey: ["/api/courses", courseId, "lessons"],
    enabled: !!courseId,
  });

  const { data: enrollment } = useQuery({
    queryKey: ["/api/courses", courseId, "enrollment"],
    enabled: !!courseId,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/courses/${courseId}/enroll`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "enrollment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/student/courses"] });
      toast({
        title: "Enrolled successfully!",
        description: "You can now start learning this course.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="aspect-video w-full bg-muted animate-pulse rounded-2xl" />
        <div className="space-y-3">
          <div className="h-10 bg-muted rounded animate-pulse w-2/3" />
          <div className="h-4 bg-muted rounded animate-pulse w-full" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Course not found</h2>
          <Button onClick={() => setLocation("/courses")}>
            Browse Courses
          </Button>
        </div>
      </Card>
    );
  }

  const groupedLessons = lessons?.reduce((acc: any, lesson: any) => {
    const module = lesson.moduleNumber || 1;
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(lesson);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative overflow-hidden">
        <BookOpen className="h-32 w-32 text-primary/30" />
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-semibold mb-2">{course.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              </div>
              <Badge variant="secondary" className="capitalize flex-shrink-0">
                {course.difficulty}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{course.instructorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{course.duration} hours</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{lessons?.length || 0} lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>{course.category}</span>
              </div>
            </div>

            {enrollment && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your Progress</span>
                  <span className="font-medium">{enrollment.progress || 0}%</span>
                </div>
                <Progress value={enrollment.progress || 0} className="h-2" />
              </div>
            )}
          </div>

          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="curriculum" data-testid="tab-curriculum">
                Curriculum
              </TabsTrigger>
              <TabsTrigger value="overview" data-testid="tab-overview">
                Overview
              </TabsTrigger>
              <TabsTrigger value="instructor" data-testid="tab-instructor">
                Instructor
              </TabsTrigger>
            </TabsList>
            <TabsContent value="curriculum" className="space-y-4 mt-6">
              <Accordion type="single" collapsible className="w-full">
                {Object.keys(groupedLessons || {}).map((module) => (
                  <AccordionItem key={module} value={`module-${module}`}>
                    <AccordionTrigger className="text-lg font-medium">
                      Module {module}
                      <span className="ml-2 text-sm text-muted-foreground font-normal">
                        ({groupedLessons[module].length} lessons)
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {groupedLessons[module].map((lesson: any, index: number) => (
                          <div
                            key={lesson.id}
                            className={`flex items-center gap-3 rounded-lg border p-3 ${
                              enrollment ? "hover-elevate cursor-pointer" : ""
                            }`}
                            onClick={() => {
                              if (enrollment) {
                                setLocation(`/courses/${courseId}/lessons/${lesson.id}`);
                              }
                            }}
                            data-testid={`lesson-${lesson.id}`}
                          >
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted flex-shrink-0">
                              {lesson.completed ? (
                                <CheckCircle className="h-5 w-5 text-primary" />
                              ) : enrollment ? (
                                <PlayCircle className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {index + 1}. {lesson.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {lesson.estimatedMinutes} min
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
            <TabsContent value="overview" className="space-y-4 mt-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h3>About this course</h3>
                <p>{course.description}</p>
                <h3>What you'll learn</h3>
                <ul>
                  <li>Master core concepts and fundamentals</li>
                  <li>Apply knowledge through practical examples</li>
                  <li>Build real-world projects</li>
                  <li>Prepare for advanced topics</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="instructor" className="space-y-4 mt-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {course.instructorName}
                  </h3>
                  <p className="text-muted-foreground">
                    Expert educator with years of experience in {course.category}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:w-80 flex-shrink-0">
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-4">
              {enrollment ? (
                <>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      const firstIncompleteLesson = lessons?.find(
                        (l: any) => !l.completed
                      );
                      if (firstIncompleteLesson) {
                        setLocation(
                          `/courses/${courseId}/lessons/${firstIncompleteLesson.id}`
                        );
                      }
                    }}
                    data-testid="button-continue-learning"
                  >
                    Continue Learning
                  </Button>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-medium">
                        {enrollment.completedLessons || 0}/{lessons?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{enrollment.progress || 0}%</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}
                    data-testid="button-enroll"
                  >
                    {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Start learning for free
                  </p>
                </>
              )}
              <div className="border-t pt-4 space-y-3 text-sm">
                <h4 className="font-medium">This course includes:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{lessons?.length || 0} lessons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{course.duration} hours of content</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>Certificate of completion</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
