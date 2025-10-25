import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Trophy,
  Flame,
  TrendingUp,
  Clock,
  Target,
  Award,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats } = useQuery({
    queryKey: ["/api/student/stats"],
  });

  const { data: enrolledCourses } = useQuery({
    queryKey: ["/api/student/courses"],
  });

  const { data: upcomingAssessments } = useQuery({
    queryKey: ["/api/student/assessments/upcoming"],
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["/api/student/activity"],
  });

  const progressData = [
    { day: "Mon", hours: 2 },
    { day: "Tue", hours: 3 },
    { day: "Wed", hours: 1.5 },
    { day: "Thu", hours: 4 },
    { day: "Fri", hours: 2.5 },
    { day: "Sat", hours: 3.5 },
    { day: "Sun", hours: 2 },
  ];

  const quickStats = [
    {
      label: "Courses Enrolled",
      value: stats?.coursesEnrolled || 0,
      icon: BookOpen,
      color: "text-chart-1",
    },
    {
      label: "Current Streak",
      value: `${user?.currentStreak || 0} days`,
      icon: Flame,
      color: "text-chart-4",
    },
    {
      label: "Total Points",
      value: user?.points || 0,
      icon: Trophy,
      color: "text-chart-3",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">
          Welcome back, {user?.fullName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's your learning progress and upcoming activities
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Learning Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="day"
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
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="hsl(var(--chart-1))"
                  fillOpacity={1}
                  fill="url(#colorHours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrolledCourses?.slice(0, 3).map((course: any) => (
              <div
                key={course.id}
                className="flex items-center gap-4 rounded-lg border p-4 hover-elevate cursor-pointer"
                onClick={() => setLocation(`/courses/${course.id}`)}
                data-testid={`course-card-${course.id}`}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{course.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {course.progress}% complete
                  </p>
                  <Progress value={course.progress} className="mt-2 h-2" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No courses enrolled yet</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => setLocation("/courses")}
                  data-testid="button-browse-courses"
                >
                  Browse Courses
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAssessments?.slice(0, 4).map((assessment: any) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                  data-testid={`assessment-${assessment.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{assessment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {assessment.courseName}
                    </p>
                  </div>
                  <Badge variant="secondary">{assessment.type}</Badge>
                </div>
              )) || (
                <p className="text-center py-6 text-muted-foreground">
                  No upcoming assessments
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentBadges?.map((badge: any) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                  data-testid={`badge-${badge.id}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {badge.description}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-center py-6 text-muted-foreground">
                  Keep learning to earn badges!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
