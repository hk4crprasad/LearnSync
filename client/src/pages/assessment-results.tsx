import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  Brain,
  Award,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AssessmentResults() {
  const [, params] = useRoute("/assessments/:assessmentId/results/:submissionId");
  const [, setLocation] = useLocation();
  const { assessmentId, submissionId } = params || {};

  const { data: result, isLoading } = useQuery({
    queryKey: ["/api/assessments", assessmentId, "submissions", submissionId],
  });

  if (isLoading || !result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <div className="h-24 w-24 bg-muted rounded-full animate-pulse mx-auto" />
              <div className="h-8 bg-muted rounded animate-pulse w-1/2 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.maxScore) * 100);
  const passed = percentage >= result.passingScore;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className={passed ? "border-primary" : "border-destructive"}>
        <CardContent className="p-12 text-center space-y-6">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full mx-auto ${
              passed ? "bg-primary/10" : "bg-destructive/10"
            }`}
          >
            {passed ? (
              <CheckCircle className="h-12 w-12 text-primary" />
            ) : (
              <XCircle className="h-12 w-12 text-destructive" />
            )}
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold">
              {passed ? "Congratulations!" : "Keep Trying!"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {passed
                ? "You've passed this assessment"
                : "You didn't pass this time, but you can try again"}
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-6xl font-bold text-primary">{percentage}%</div>
            <p className="text-sm text-muted-foreground">
              {result.score} out of {result.maxScore} points
            </p>
          </div>
          <Badge variant={passed ? "default" : "destructive"} className="text-lg px-4 py-2">
            {passed ? "Passed" : `Need ${result.passingScore}% to pass`}
          </Badge>
        </CardContent>
      </Card>

      {result.aiFeedback && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Feedback & Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="leading-relaxed">{result.aiFeedback}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {result.weakAreas && result.weakAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.weakAreas.map((area: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border p-3"
                  data-testid={`weak-area-${index}`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted flex-shrink-0">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <p className="flex-1">{area}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result.recommendations && result.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.recommendations.map((rec: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border p-4 hover-elevate"
                  data-testid={`recommendation-${index}`}
                >
                  <ChevronRight className="h-5 w-5 text-primary flex-shrink-0" />
                  <p className="flex-1 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result.topicPerformance && (
        <Card>
          <CardHeader>
            <CardTitle>Performance by Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={result.topicPerformance}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="topic"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="score" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          onClick={() => setLocation(`/courses/${result.courseId}`)}
          data-testid="button-back-to-course"
        >
          Back to Course
        </Button>
        {!passed && (
          <Button
            onClick={() => setLocation(`/assessments/${assessmentId}`)}
            data-testid="button-retry"
          >
            Try Again
          </Button>
        )}
        <Button onClick={() => setLocation("/dashboard")} data-testid="button-dashboard">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
