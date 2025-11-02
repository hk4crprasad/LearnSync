import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Sparkles, Target } from "lucide-react";
import { PersonalizedGame } from "@/utils/personalizedGameGenerator";
import { useTranslation } from "react-i18next";

interface InteractiveGameCardProps {
  game: PersonalizedGame;
  index: number;
  onPlay: (gameId: string) => void;
}

const InteractiveGameCard = ({ game, index, onPlay }: InteractiveGameCardProps) => {
  const { t } = useTranslation();
  const difficultyColors = {
    Easy: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    Medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    Hard: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
  };

  const typeIcons: Record<string, string> = {
    "Story Adventure": "📖",
    "Building/Design Simulation": "🏗️",
    "Trading/Teamwork": "🤝",
    "Exploration/Discovery": "🔍"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 group relative">
        {/* Gradient top bar */}
        <div className={`h-2 bg-gradient-to-r ${game.color}`} />
        
        {/* Sparkle effect on hover */}
        <motion.div
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-5 w-5 text-primary" />
        </motion.div>

        <CardHeader className="pb-4">
          <div className="flex items-start gap-3 mb-2">
            {/* Emoji Icon */}
            <motion.div
              className="text-5xl"
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {game.emoji}
            </motion.div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className={difficultyColors[game.difficulty]}>
                  {game.difficulty}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {typeIcons[game.type]} {game.type}
                </Badge>
              </div>
              
              <CardTitle className="text-xl group-hover:text-primary transition-colors leading-tight">
                {game.title}
              </CardTitle>
            </div>
          </div>
          
          <CardDescription className="text-sm leading-relaxed min-h-[60px]">
            {game.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Learning Outcome */}
          <div className="flex gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-primary mb-1">{t("game.you_will_learn")}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {game.learningOutcome}
              </p>
            </div>
          </div>

          {/* Interests Tags */}
          {game.interests.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {game.interests.map((interest, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs bg-background"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          )}

          {/* Play Button */}
          <Button
            className="w-full group-hover:shadow-lg transition-all"
            size="lg"
            onClick={() => onPlay(game.id)}
          >
            <Play className="h-4 w-4 mr-2" />
            {t("game.start_adventure")}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InteractiveGameCard;
