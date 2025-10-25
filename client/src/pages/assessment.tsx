import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";

export default function Assessment() {
  const [, params] = useRoute("/assessments/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const assessmentId = params?.id;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds

  const { data: assessment, isLoading } = useQuery({
    queryKey: ["/api/assessments", assessmentId],
  });

  const { data: questions } = useQuery({
    queryKey: ["/api/assessments", assessmentId, "questions"],
    enabled: !!assessmentId,
  });

  useEffect(() => {
    if (!assessment) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [assessment]);

  const submitMutation = useMutation({
    mutationFn: async (data: { answers: number[] }) => {
      return await apiRequest("POST", `/api/assessments/${assessmentId}/submit`, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/student/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/student/activity"] });
      setLocation(`/assessments/${assessmentId}/results/${data.submissionId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const answerArray = questions?.map((_: any, index: number) => answers[index] ?? -1);
    submitMutation.mutate({ answers: answerArray });
  };

  if (isLoading || !assessment || !questions) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <Card>
          <CardContent className="p-8 space-y-4">
            <div className="h-6 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{assessment.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-2 text-lg font-medium">
            <Clock className="h-5 w-5" />
            <span data-testid="timer">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {currentQuestion + 1}. {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={answers[currentQuestion]?.toString()}
            onValueChange={(value) =>
              setAnswers({ ...answers, [currentQuestion]: parseInt(value) })
            }
          >
            <div className="space-y-3">
              {currentQ.options.map((option: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 rounded-lg border p-4 hover-elevate cursor-pointer"
                  data-testid={`option-${index}`}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          data-testid="button-previous"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          {Object.keys(answers).length} of {questions.length} answered
        </div>
        {currentQuestion < questions.length - 1 ? (
          <Button
            onClick={() =>
              setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))
            }
            data-testid="button-next"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            data-testid="button-submit-assessment"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Assessment"}
          </Button>
        )}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`aspect-square rounded-md text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? "bg-primary text-primary-foreground"
                    : answers[index] !== undefined
                      ? "bg-primary/20 text-foreground"
                      : "bg-background border hover-elevate"
                }`}
                data-testid={`question-nav-${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
