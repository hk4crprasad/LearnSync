import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";

export default function Leaderboard() {
  const { user } = useAuth();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getRankBadgeVariant = (rank: number) => {
    if (rank <= 3) return "default";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          See how you rank among your peers
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {leaderboard?.slice(0, 3).map((student: any, index: number) => (
          <Card
            key={student.id}
            className={`p-6 text-center space-y-4 ${
              index === 0 ? "md:col-span-3 lg:col-span-1" : ""
            }`}
            data-testid={`top-student-${index + 1}`}
          >
            <div className="flex justify-center">
              {getMedalIcon(index + 1)}
            </div>
            <Avatar className="h-20 w-20 mx-auto">
              <AvatarImage src={student.avatar} />
              <AvatarFallback className="text-2xl">
                {student.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{student.fullName}</h3>
              <p className="text-sm text-muted-foreground">
                Rank #{index + 1}
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-primary">
                {student.points.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">points</p>
            </div>
            <div className="flex justify-center gap-3 text-sm">
              <div>
                <div className="font-medium">{student.coursesCompleted || 0}</div>
                <div className="text-muted-foreground">Courses</div>
              </div>
              <div className="border-l" />
              <div>
                <div className="font-medium">{student.currentStreak || 0}</div>
                <div className="text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">All Rankings</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted animate-pulse"
                >
                  <div className="h-12 w-12 rounded-full bg-muted-foreground/20" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted-foreground/20 rounded w-1/3" />
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard?.map((student: any, index: number) => (
                <div
                  key={student.id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    student.id === user?.id
                      ? "bg-primary/10 border-2 border-primary"
                      : "border hover-elevate"
                  }`}
                  data-testid={`leaderboard-row-${index + 1}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 flex items-center justify-center">
                      {getMedalIcon(index + 1) || (
                        <Badge variant={getRankBadgeVariant(index + 1)}>
                          {index + 1}
                        </Badge>
                      )}
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>
                        {student.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{student.fullName}</p>
                        {student.id === user?.id && (
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {student.coursesCompleted || 0} courses completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {student.points.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">How to Earn Points</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">+10</div>
              <p className="text-sm text-muted-foreground">Complete a lesson</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">+50</div>
              <p className="text-sm text-muted-foreground">Pass an assessment</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">+100</div>
              <p className="text-sm text-muted-foreground">Complete a course</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">+5</div>
              <p className="text-sm text-muted-foreground">Daily login streak</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
