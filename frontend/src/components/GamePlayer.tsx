import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PersonalizedGame } from "@/utils/personalizedGameGenerator";
import { getRandomQuestions, QuestionTemplate } from "@/utils/questionBank";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Star,
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  Heart,
  Zap,
  Award,
  Lock,
  TrendingUp
} from "lucide-react";

interface GamePlayerProps {
  game: PersonalizedGame;
  onClose: () => void;
}

const GamePlayer = ({ game, onClose }: GamePlayerProps) => {
  const { updateProgress, userProfile } = useUserProfile();
  const { t } = useTranslation();
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [challenges, setChallenges] = useState<QuestionTemplate[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showLevelSelect, setShowLevelSelect] = useState(true);

  // Get user's progress for this game
  const gameProgress = userProfile?.gameProgress[game.id];
  const maxUnlockedLevel = gameProgress?.level || 1;
  const completedAttempts = gameProgress?.completedAttempts || 0;
  const highScore = gameProgress?.highScore || 0;

  const getDifficultyFromLevel = (level: number): string => {
    if (level === 1) return "Easy";
    if (level === 2) return "Medium";
    return "Hard";
  };

  const getLevelName = (level: number): string => {
    if (level === 1) return t("game.level_easy");
    if (level === 2) return t("game.level_medium");
    return t("game.level_hard");
  };

  const getLevelColor = (level: number): string => {
    if (level === 1) return "from-green-500 to-emerald-500";
    if (level === 2) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-rose-500";
  };

  const startLevel = (level: number) => {
    const difficulty = getDifficultyFromLevel(level);
    const questions = getRandomQuestions(game.type, difficulty, 5);
    
    if (questions.length === 0) {
      toast.error("No questions available for this level");
      return;
    }

    setChallenges(questions);
    setCurrentLevel(level);
    setShowLevelSelect(false);
    setCurrentChallenge(0);
    setScore(0);
    setLives(3);
    setSelectedOption(null);
    setShowFeedback(false);
    setGameCompleted(false);
  };

  const handleOptionSelect = (index: number) => {
    if (showFeedback) return;
    
    setSelectedOption(index);
    const challenge = challenges[currentChallenge];
    const option = challenge.options[index];
    
    setIsCorrect(option.isCorrect);
    setShowFeedback(true);

    if (option.isCorrect) {
      setScore(score + 20);
      toast.success(t("game.correct") + " 🎉", { description: option.feedback });
    } else {
      setLives(lives - 1);
      toast.error(t("game.incorrect") + " 💭", { description: option.feedback });
    }
  };

  const handleNext = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(currentChallenge + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      // Game completed
      const earnedPoints = score;
      updateProgress(game.id, earnedPoints, score);
      setGameCompleted(true);
      
      const newProgress = userProfile?.gameProgress[game.id];
      const attempts = (newProgress?.completedAttempts || 0) + 1;
      
      if (attempts >= 3 && currentLevel < 3) {
        toast.success(`🎉 ${t("game.adventure_complete")}`, {
          description: `${t("game.you_earned")} ${earnedPoints} ${t("game.points")}!`
        });
      } else {
        toast.success(`🎉 ${t("game.adventure_complete")}`, {
          description: `${t("game.you_earned")} ${earnedPoints} ${t("game.points")}!`
        });
      }
    }
  };

  const getStarRating = () => {
    const percentage = (score / (challenges.length * 20)) * 100;
    if (percentage >= 80) return 3;
    if (percentage >= 60) return 2;
    return 1;
  };

  const handlePlayAgain = () => {
    setShowLevelSelect(true);
    setGameCompleted(false);
  };

  if (showLevelSelect) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{game.emoji}</span>
                <div>
                  <DialogTitle className="text-2xl">{game.title}</DialogTitle>
                  <DialogDescription>Choose Your Level</DialogDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Player Stats */}
            {gameProgress && (
              <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t("dashboard.progress")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-bold text-lg">{completedAttempts}/3</div>
                      <div className="text-muted-foreground">{t("game.attempts")}</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">{highScore}</div>
                      <div className="text-muted-foreground">{t("game.high_score")}</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">{maxUnlockedLevel}/3</div>
                      <div className="text-muted-foreground">{t("game.level")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Level Selection */}
            <div className="space-y-3">
              {[1, 2, 3].map((level) => {
                const isLocked = level > maxUnlockedLevel;
                const isHardLevel = level === 3;
                
                return (
                  <motion.div
                    key={level}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: level * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      className={`w-full h-auto py-6 px-6 ${
                        isLocked ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
                      }`}
                      onClick={() => !isLocked && startLevel(level)}
                      disabled={isLocked}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getLevelColor(level)} flex items-center justify-center text-white font-bold text-lg`}>
                            {level}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-lg flex items-center gap-2">
                              {getLevelName(level)}
                              {isHardLevel && !isLocked && (
                                <Badge variant="destructive" className="text-xs">
                                  🔥 {t("game.level_hard")}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {isLocked 
                                ? t("game.unlock_requirement")
                                : `5 ${t("chat.question")} • 100 ${t("game.points")}`}
                            </div>
                          </div>
                        </div>
                        {isLocked ? (
                          <Lock className="h-6 w-6 text-muted-foreground" />
                        ) : (
                          <TrendingUp className="h-6 w-6 text-primary" />
                        )}
                      </div>
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <p className="text-sm text-center">
                  💡 <strong>{t("game.tip")}:</strong> {t("game.tip_questions_change")}
                </p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (challenges.length === 0) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <Sparkles className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{game.emoji}</span>
              <div>
                <DialogTitle className="text-2xl">{game.title}</DialogTitle>
                <DialogDescription>{getLevelName(currentLevel)} • {game.type}</DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {!gameCompleted ? (
          <div className="space-y-6 py-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("game.challenge_of", { current: currentChallenge + 1, total: challenges.length })}
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">{score}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: lives }).map((_, i) => (
                      <Heart key={i} className="h-4 w-4 fill-red-500 text-red-500" />
                    ))}
                  </div>
                </div>
              </div>
              <Progress value={((currentChallenge + 1) / challenges.length) * 100} />
            </div>

            {/* Challenge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentChallenge}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg leading-relaxed">
                      {challenges[currentChallenge].scenario}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {challenges[currentChallenge].options.map((option, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                        whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                      >
                        <Button
                          variant={
                            showFeedback && selectedOption === index
                              ? option.isCorrect
                                ? "default"
                                : "destructive"
                              : "outline"
                          }
                          className={`w-full justify-start text-left h-auto py-4 px-4 ${
                            showFeedback && selectedOption === index
                              ? option.isCorrect
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                              : ""
                          }`}
                          onClick={() => handleOptionSelect(index)}
                          disabled={showFeedback}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="flex-1">{option.text}</span>
                            {showFeedback && selectedOption === index && (
                              option.isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-5 w-5 flex-shrink-0" />
                              )
                            )}
                          </div>
                        </Button>
                      </motion.div>
                    ))}

                    {showFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4"
                      >
                        <Card className={isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"}>
                          <CardContent className="pt-4">
                            <p className="text-sm leading-relaxed">
                              {challenges[currentChallenge].options[selectedOption!].feedback}
                            </p>
                          </CardContent>
                        </Card>

                        <Button
                          onClick={handleNext}
                          className="w-full mt-4"
                          size="lg"
                        >
                          {currentChallenge < challenges.length - 1 ? t("game.next_challenge") : t("game.complete_adventure")}
                          <Zap className="h-4 w-4 ml-2" />
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-6"
          >
            <div className="flex justify-center gap-2">
              {Array.from({ length: getStarRating() }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                >
                  <Star className="h-12 w-12 fill-yellow-500 text-yellow-500" />
                </motion.div>
              ))}
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-2">🎉 {t("game.adventure_complete")}!</h3>
              <p className="text-xl text-muted-foreground">{game.title}</p>
            </div>

            <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <div className="text-2xl font-bold">{score}</div>
                    <div className="text-sm text-muted-foreground">{t("game.you_earned")} {t("game.points")}</div>
                  </div>
                  <div>
                    <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{getStarRating()}/3</div>
                    <div className="text-sm text-muted-foreground">{t("game.stars")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {completedAttempts + 1 === 3 && currentLevel < 3 && (
              <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-500">
                <CardContent className="pt-4">
                  <p className="text-sm font-semibold text-center flex items-center justify-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    🎉 {t("game.next_level_unlocked")}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Button onClick={handlePlayAgain} variant="outline" className="w-full" size="lg">
                <Sparkles className="h-4 w-4 mr-2" />
                {t("game.play_another_level")}
              </Button>
              <Button onClick={onClose} className="w-full" size="lg">
                {t("game.back_to_games")}
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GamePlayer;
