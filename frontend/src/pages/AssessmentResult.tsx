import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Home } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AssessmentResult = () => {
  const { id } = useParams(); // This is the assessment_id
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [result, setResult] = useState<any>(location.state?.result || null);
  const [isLoading, setIsLoading] = useState(!location.state?.result);

  useEffect(() => {
    if (!result && id && user) {
      loadResult();
    }
  }, [id, user]);

  const loadResult = async () => {
    if (!id || !user) return;
    
    try {
      setIsLoading(true);
      const results = await api.getAssessmentResult(id, user.id);
      if (results && results.length > 0) {
        setResult(results[0]); // Get the most recent result
      } else {
        toast.error("No results found for this assessment");
      }
    } catch (error) {
      toast.error("Failed to load result");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <p>Result not found</p>
        <Button onClick={() => navigate("/dashboard")}>
          <Home className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className={`bg-gradient-to-r ${result.passed ? "from-green-500 to-emerald-500" : "from-orange-500 to-red-500"} text-white`}>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              {result.passed ? "Congratulations! 🎉" : "Keep Trying! 💪"}
            </h1>
            <p className="text-2xl mb-2">Score: {result.score.toFixed(1)}%</p>
            <p className="text-lg">
              {result.earned_points} / {result.total_points} points
            </p>
            <Badge variant={result.passed ? "default" : "destructive"} className="mt-4">
              {result.passed ? "Passed" : "Not Passed"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {result.ai_overall_feedback && (
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle>Overall Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result.ai_overall_feedback}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        <h2 className="text-2xl font-bold mb-4">Question Review</h2>
        <div className="space-y-4">
          {result.question_results.map((qr: any, index: number) => (
            <Card key={index} className={qr.is_correct ? "border-green-200" : "border-red-200"}>
              <CardHeader>
                <div className="flex items-start gap-2">
                  {qr.is_correct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-1" />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      Q{index + 1}. {qr.question_text}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={qr.is_correct ? "default" : "destructive"}>
                        {qr.points_earned} pts
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Your Answer:</p>
                    <p className={qr.is_correct ? "text-green-600" : "text-red-600"}>
                      {qr.student_answer}
                    </p>
                  </div>
                  {!qr.is_correct && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Correct Answer:</p>
                      <p className="text-green-600">{qr.correct_answer}</p>
                    </div>
                  )}
                </div>
                {qr.ai_feedback && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="font-medium mb-2">AI Feedback:</p>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {qr.ai_feedback}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate("/dashboard")} size="lg">
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResult;
