import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, TrendingUp, TrendingDown, Minus, Target, BookOpen, RefreshCw, Calendar, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TopicPerformance {
  topic: string;
  average_score: number;
  accuracy: number;
  attempts: number;
}

interface AdaptiveGoal {
  type: string;
  description: string;
  target?: number;
  current?: number;
  priority: string;
  topic?: string;
}

interface RevisionCycle {
  topic: string;
  current_mastery: number;
  target_mastery: number;
  recommended_frequency: string;
  estimated_time_minutes: number;
  next_revision_date: string;
}

interface StudyPlan {
  student_id: string;
  generated_at: string;
  performance_summary: {
    total_assessments: number;
    average_score: number;
    performance_trend: string;
    strong_topics: TopicPerformance[];
    weak_topics: TopicPerformance[];
    needs_revision: TopicPerformance[];
    recent_scores: number[];
  };
  ai_study_plan: string;
  revision_cycles: RevisionCycle[];
  adaptive_goals: AdaptiveGoal[];
  recommended_practice_topics: string[];
  status?: string;
  message?: string;
}

const AdaptiveLearning = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);

  useEffect(() => {
    loadStudyPlan();
  }, []);

  const loadStudyPlan = async () => {
    setLoading(true);
    try {
      const data = await api.get<StudyPlan>("/api/analytics/adaptive/study-plan");
      setStudyPlan(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load study plan");
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "Daily";
      case "every_2_days":
        return "Every 2 Days";
      case "weekly":
        return "Weekly";
      default:
        return frequency;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const startPractice = (topic: string) => {
    navigate(`/practice?topic=${encodeURIComponent(topic)}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!studyPlan || studyPlan.status === "no_data") {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6" />
              Adaptive Learning
            </CardTitle>
            <CardDescription>
              {studyPlan?.message || "Complete some assessments to get personalized recommendations"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get started by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                {studyPlan?.suggested_actions?.map((action, idx) => (
                  <li key={idx}>{action}</li>
                )) || [
                  "Enrolling in courses",
                  "Taking practice assessments",
                  "Completing course assignments"
                ].map((action, idx) => (
                  <li key={idx}>{action}</li>
                ))}
              </ul>
              <div className="flex gap-4 pt-4">
                <Button onClick={() => navigate("/courses")}>
                  Browse Courses
                </Button>
                <Button variant="outline" onClick={() => navigate("/practice")}>
                  Start Practice
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { performance_summary } = studyPlan;

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Adaptive Learning Plan
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalized recommendations based on your performance
          </p>
        </div>
        <Button variant="outline" onClick={loadStudyPlan}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Performance Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{performance_summary.average_score}%</div>
            <Progress value={performance_summary.average_score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getTrendIcon(performance_summary.performance_trend)}
              <span className="text-xl font-semibold capitalize">
                {performance_summary.performance_trend.replace("_", " ")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Assessments Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{performance_summary.total_assessments}</div>
            <p className="text-sm text-muted-foreground mt-1">Total completed</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Study Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI-Generated Study Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {studyPlan.ai_study_plan}
          </div>
        </CardContent>
      </Card>

      {/* Adaptive Goals */}
      {studyPlan.adaptive_goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Learning Goals
            </CardTitle>
            <CardDescription>
              Personalized milestones to track your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studyPlan.adaptive_goals.map((goal, idx) => (
                <div key={idx} className="border-l-4 border-primary pl-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{goal.description}</p>
                      {goal.target && goal.current !== undefined && (
                        <div className="mt-2">
                          <Progress 
                            value={(goal.current / goal.target) * 100} 
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {goal.current.toFixed(1)}% / {goal.target}%
                          </p>
                        </div>
                      )}
                    </div>
                    <Badge variant={getPriorityColor(goal.priority) as any}>
                      {goal.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topics to Focus On */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weak Topics */}
        {performance_summary.weak_topics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <BookOpen className="h-5 w-5" />
                Topics Needing Attention
              </CardTitle>
              <CardDescription>
                Focus on these areas to improve your mastery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performance_summary.weak_topics.map((topic, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{topic.topic}</h4>
                      <Badge variant="destructive">{topic.accuracy.toFixed(1)}%</Badge>
                    </div>
                    <Progress value={topic.accuracy} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{topic.attempts} attempts</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => startPractice(topic.topic)}
                      >
                        Practice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strong Topics */}
        {performance_summary.strong_topics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-5 w-5" />
                Your Strong Topics
              </CardTitle>
              <CardDescription>
                Great job! Keep practicing to maintain mastery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performance_summary.strong_topics.map((topic, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{topic.topic}</h4>
                      <Badge variant="default" className="bg-green-500">{topic.accuracy.toFixed(1)}%</Badge>
                    </div>
                    <Progress value={topic.accuracy} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{topic.attempts} attempts</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Revision Schedule */}
      {studyPlan.revision_cycles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Revision Schedule
            </CardTitle>
            <CardDescription>
              Spaced repetition plan to improve retention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studyPlan.revision_cycles.map((cycle, idx) => (
                <div key={idx} className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex-1">
                    <h4 className="font-medium">{cycle.topic}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Current: {cycle.current_mastery.toFixed(1)}%</span>
                      <span>Target: {cycle.target_mastery}%</span>
                      <span>Frequency: {getFrequencyLabel(cycle.recommended_frequency)}</span>
                      <span>~{cycle.estimated_time_minutes} min</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Next revision:</p>
                    <p className="font-medium">{formatDate(cycle.next_revision_date)}</p>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => startPractice(cycle.topic)}
                    >
                      Start Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Practice Shortcuts */}
      {studyPlan.recommended_practice_topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Practice</CardTitle>
            <CardDescription>
              Jump into practice sessions for your priority topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {studyPlan.recommended_practice_topics.map((topic, idx) => (
                <Button 
                  key={idx}
                  variant="outline"
                  onClick={() => startPractice(topic)}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdaptiveLearning;
