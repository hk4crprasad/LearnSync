import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, Assessment } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

const TakeAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (id) loadAssessment();
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && assessment) {
      handleSubmit();
    }
  }, [timeLeft]);

  const loadAssessment = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAssessment(id!);
      setAssessment(data);
      setTimeLeft(data.time_limit);
    } catch (error) {
      toast.error("Failed to load assessment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleSubmit = async () => {
    if (!user || !assessment) return;

    const answersArray = Object.entries(answers).map(([index, answer]) => ({
      question_index: parseInt(index),
      answer,
    }));

    if (answersArray.length < assessment.questions.length) {
      toast.error("Please answer all questions");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.submitAssessment({
        assessment_id: assessment.id,
        student_id: user.id,
        answers: answersArray,
      });
      toast.success("Assessment submitted successfully!");
      // Navigate with result data in state
      navigate(`/assessment-result/${assessment.id}`, { state: { result } });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Assessment not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{assessment.title}</h1>
              <p className="text-white/90 mt-2">{assessment.description}</p>
              <p className="text-sm text-white/80 mt-1">
                Passing Score: {assessment.passing_score}%
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Clock className="h-5 w-5" />
              <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {assessment.questions.map((question, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-start gap-2">
                  <span className="text-primary">Q{index + 1}.</span>
                  <span className="flex-1">{question.question_text}</span>
                  <span className="text-sm text-muted-foreground">
                    {question.points} pts
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {question.question_type === "multiple_choice" && question.options ? (
                  <RadioGroup
                    value={answers[index]}
                    onValueChange={(value) => handleAnswerChange(index, value)}
                  >
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value={option.text} id={`q${index}-o${oIndex}`} />
                        <Label htmlFor={`q${index}-o${oIndex}`} className="flex-1 cursor-pointer">
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <RadioGroup
                    value={answers[index]}
                    onValueChange={(value) => handleAnswerChange(index, value)}
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="true" id={`q${index}-true`} />
                      <Label htmlFor={`q${index}-true`} className="flex-1 cursor-pointer">
                        True
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="false" id={`q${index}-false`} />
                      <Label htmlFor={`q${index}-false`} className="flex-1 cursor-pointer">
                        False
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Submit Assessment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TakeAssessment;
