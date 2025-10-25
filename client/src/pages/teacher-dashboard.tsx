import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats } = useQuery({
    queryKey: ["/api/teacher/stats"],
  });

  const { data: classes } = useQuery({
    queryKey: ["/api/teacher/classes"],
  });

  const performanceData = [
    { class: "Math 101", avg: 78 },
    { class: "Physics 201", avg: 82 },
    { class: "Chemistry", avg: 75 },
    { class: "Biology", avg: 85 },
  ];

  const engagementData = [
    { week: "Week 1", active: 45 },
    { week: "Week 2", active: 52 },
    { week: "Week 3", active: 48 },
    { week: "Week 4", active: 58 },
  ];

  const quickStats = [
    {
      label: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "text-chart-1",
    },
    {
      label: "Active Courses",
      value: stats?.activeCourses || 0,
      icon: BookOpen,
      color: "text-chart-3",
    },
    {
      label: "Avg. Completion",
      value: `${stats?.avgCompletion || 0}%`,
      icon: TrendingUp,
      color: "text-chart-2",
    },
    {
      label: "At-Risk Students",
      value: stats?.atRiskStudents || 0,
      icon: AlertCircle,
      color: "text-destructive",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor class performance and student progress
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Class Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="class"
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
                <Bar dataKey="avg" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Engagement Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="week"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-2))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Classes</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/teacher/classes")}
                data-testid="button-view-all-classes"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classes?.slice(0, 4).map((cls: any) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover-elevate cursor-pointer"
                  onClick={() => setLocation(`/teacher/classes/${cls.id}`)}
                  data-testid={`class-${cls.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{cls.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {cls.studentCount} students
                    </p>
                  </div>
                  <Badge variant="secondary">{cls.category}</Badge>
                </div>
              )) || (
                <p className="text-center py-6 text-muted-foreground">
                  No classes yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Students Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.atRiskStudentsList?.slice(0, 4).map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                  data-testid={`at-risk-student-${student.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.courseName} - {student.score}% avg
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLocation(`/teacher/messages?student=${student.id}`)}
                    data-testid={`button-message-${student.id}`}
                  >
                    Message
                  </Button>
                </div>
              )) || (
                <p className="text-center py-6 text-muted-foreground">
                  All students performing well!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.recentSubmissions?.map((submission: any) => (
              <div
                key={submission.id}
                className="flex items-center gap-4 rounded-lg border p-3"
                data-testid={`submission-${submission.id}`}
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <p className="font-medium">{submission.studentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {submission.assessmentTitle}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Score</p>
                    <p className="font-medium">
                      {submission.score}/{submission.maxScore}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Submitted</p>
                    <p className="font-medium">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={submission.score >= 70 ? "default" : "destructive"}
                >
                  {submission.score >= 70 ? (
                    <CheckCircle className="mr-1 h-3 w-3" />
                  ) : (
                    <Clock className="mr-1 h-3 w-3" />
                  )}
                  {submission.score >= 70 ? "Passed" : "Needs Review"}
                </Badge>
              </div>
            )) || (
              <p className="text-center py-6 text-muted-foreground">
                No recent submissions
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
