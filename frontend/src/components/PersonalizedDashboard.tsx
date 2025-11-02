import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { getPersonalizedWelcome, getMotivationalMessage } from "@/utils/gameRecommendations";
import { generatePersonalizedGames, getGameMotivation, PersonalizedGame } from "@/utils/personalizedGameGenerator";
import { generateVisualGames, VisualGameTemplate } from "@/utils/visualGameTypes";
import InteractiveGameCard from "@/components/InteractiveGameCard";
import GamePlayer from "@/components/GamePlayer";
import VisualGamePlayer from "@/components/games/VisualGamePlayer";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  User,
  Star,
  Trophy,
  Target,
  Heart,
  Settings,
  TrendingUp,
  Award,
  Zap,
  Sparkles,
  Rocket,
  Gamepad2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UserProfileForm from "./UserProfileForm";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const PersonalizedDashboard = () => {
  const { userProfile, clearProfile } = useUserProfile();
  const { t } = useTranslation();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeGame, setActiveGame] = useState<PersonalizedGame | null>(null);
  const [activeVisualGame, setActiveVisualGame] = useState<VisualGameTemplate | null>(null);

  if (!userProfile) return null;

  const welcomeMessage = getPersonalizedWelcome(userProfile);
  const motivationalMsg = getMotivationalMessage(userProfile);
  // Create a personalized welcome message with translation
  const firstName = userProfile.name?.split(' ')[0] || userProfile.nickname || 'there';
  const personalizedGameWelcome = t("game.welcome_message") + ` ${firstName}! ${t("game.welcome_subtitle")}`;

  // Generate personalized games based on user profile
  const personalizedGames = generatePersonalizedGames(userProfile);
  const visualGames = generateVisualGames(userProfile);

  // Calculate overall progress
  const totalPossiblePoints = 510; // 85 points per game × 6 games
  const progressPercentage = (userProfile.totalPoints / totalPossiblePoints) * 100;

  const handlePlayGame = (gameId: string) => {
    const game = personalizedGames.find(g => g.id === gameId);
    if (game) {
      setActiveGame(game);
      toast.success(`🎮 Starting ${game.title}...`, {
        description: getGameMotivation(game.type)
      });
    }
  };

  const handlePlayVisualGame = (game: VisualGameTemplate) => {
    console.log("handlePlayVisualGame called with:", game);
    setActiveVisualGame(game);
    console.log("activeVisualGame set to:", game.title);
  };

  const handleVisualGameComplete = (score: number, maxScore: number) => {
    const percentage = Math.round((score / maxScore) * 100);
    toast.success(`Game Complete! 🎉`, {
      description: `You scored ${score}/${maxScore} points (${percentage}%)`
    });
    setActiveVisualGame(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {welcomeMessage}
              </h1>
              <p className="text-muted-foreground mt-2">{motivationalMsg}</p>
            </div>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Your Profile</DialogTitle>
                </DialogHeader>
                <UserProfileForm onComplete={() => setShowEditDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                    <p className="text-3xl font-bold text-primary">{userProfile.totalPoints}</p>
                  </div>
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-yellow-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Challenges</p>
                    <p className="text-3xl font-bold text-yellow-600">{userProfile.completedChallenges}</p>
                  </div>
                  <Zap className="h-10 w-10 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Games Completed</p>
                    <p className="text-3xl font-bold text-green-600">{userProfile.completedGames.length}/6</p>
                  </div>
                  <Award className="h-10 w-10 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Progress</p>
                    <p className="text-3xl font-bold text-purple-600">{Math.round(progressPercentage)}%</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {userProfile.nickname.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {userProfile.name}
                    <Badge variant="outline">{userProfile.ageGroup} years</Badge>
                  </CardTitle>
                  <CardDescription>@{userProfile.nickname}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-sm">Interests</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {userProfile.learningGoals.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">Learning Goals</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.learningGoals.map((goal, index) => (
                      <Badge key={index} variant="outline">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Learning Journey</span>
                  <span className="font-semibold">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personalized Games Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Rocket className="h-7 w-7 text-primary" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {t("game.your_adventures")}
              </h2>
            </div>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-lg text-muted-foreground mb-6 flex items-center gap-2"
          >
            <Sparkles className="h-5 w-5 text-yellow-500" />
            {personalizedGameWelcome}
          </motion.p>

          <Tabs defaultValue="visual" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="visual" className="gap-2">
                <Gamepad2 className="h-4 w-4" />
                Visual Games
              </TabsTrigger>
              <TabsTrigger value="story" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Story Adventures
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visualGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 hover:border-primary/50">
                      <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none`} />
                      <CardHeader className="relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-4xl">{game.emoji}</div>
                            <div>
                              <CardTitle className="text-lg">{game.title}</CardTitle>
                              <Badge variant="outline" className="mt-1">
                                {game.gameType.replace('-', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <Badge className={`${game.difficulty === 'Easy' ? 'bg-green-500' : game.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                            {game.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <p className="text-sm text-muted-foreground mb-4">{game.description}</p>
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            Max: {game.maxPoints} pts
                          </span>
                          <span className="text-muted-foreground">
                            {game.pointsPerCorrect} pts each
                          </span>
                        </div>
                        <Button 
                          className="w-full gap-2" 
                          onClick={() => handlePlayVisualGame(game)}
                        >
                          <Zap className="h-4 w-4" />
                          Play Now
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="story" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalizedGames.map((game, index) => (
                  <InteractiveGameCard
                    key={game.id}
                    game={game}
                    index={index}
                    onPlay={handlePlayGame}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {personalizedGames.length === 0 && visualGames.length === 0 && (
            <Card className="p-12 text-center">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">{t("game.no_games_yet")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("game.no_games_description")}
              </p>
              <Button onClick={() => setShowEditDialog(true)}>
                <Settings className="h-4 w-4 mr-2" />
                {t("game.edit_profile")}
              </Button>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Game Player Modal */}
      {activeGame && (
        <GamePlayer
          game={activeGame}
          onClose={() => setActiveGame(null)}
        />
      )}

      {/* Visual Game Player Modal */}
      {activeVisualGame && (
        <>
          {console.log("Rendering VisualGamePlayer with:", activeVisualGame)}
          <VisualGamePlayer
            game={activeVisualGame}
            onClose={() => setActiveVisualGame(null)}
            onComplete={handleVisualGameComplete}
          />
        </>
      )}
    </div>
  );
};

export default PersonalizedDashboard;
