import { useRoute, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Lesson() {
  const [, params] = useRoute("/courses/:courseId/lessons/:lessonId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { courseId, lessonId } = params || {};

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["/api/courses", courseId, "lessons", lessonId],
  });

  const { data: course } = useQuery({
    queryKey: ["/api/courses", courseId],
  });

  const { data: allLessons } = useQuery({
    queryKey: ["/api/courses", courseId, "lessons"],
  });

  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/lessons/${lessonId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "lessons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/student/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/student/courses"] });
      toast({
        title: "Lesson completed!",
        description: "Great job! Keep up the momentum.",
      });
    },
  });

  if (isLoading || !lesson) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <Card>
          <CardContent className="p-8 space-y-4">
            <div className="h-6 bg-muted rounded animate-pulse" />
            <div className="aspect-video bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentIndex = allLessons?.findIndex((l: any) => l.id === lessonId) ?? 0;
  const prevLesson = allLessons?.[currentIndex - 1];
  const nextLesson = allLessons?.[currentIndex + 1];
  const progress = allLessons
    ? ((currentIndex + 1) / allLessons.length) * 100
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setLocation(`/courses/${courseId}`)}
          data-testid="button-back-to-course"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to {course?.title}
        </Button>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold">{lesson.title}</h1>
            {lesson.completed && (
              <CheckCircle className="h-6 w-6 text-primary" data-testid="icon-completed" />
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Lesson {currentIndex + 1} of {allLessons?.length || 0}</span>
            <span>•</span>
            <span>{lesson.estimatedMinutes} min</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {lesson.videoUrl && (
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <PlayCircle className="h-16 w-16 text-primary" />
              <p className="sr-only">Video player for {lesson.title}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-8">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setLocation(`/courses/${courseId}/lessons/${prevLesson.id}`)}
          disabled={!prevLesson}
          data-testid="button-previous-lesson"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous Lesson
        </Button>

        <div className="flex gap-2">
          {!lesson.completed && (
            <Button
              variant="outline"
              onClick={() => markCompleteMutation.mutate()}
              disabled={markCompleteMutation.isPending}
              data-testid="button-mark-complete"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
          )}
          {nextLesson ? (
            <Button
              onClick={() => setLocation(`/courses/${courseId}/lessons/${nextLesson.id}`)}
              data-testid="button-next-lesson"
            >
              Next Lesson
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={() => setLocation(`/courses/${courseId}`)}
              data-testid="button-back-to-course-final"
            >
              Back to Course
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
