import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import WordScrambleGame from "./WordScrambleGame";
import MatchingPairsGame from "./MatchingPairsGame";
import MemoryCardsGame from "./MemoryCardsGame";
import PatternRecognitionGame from "./PatternRecognitionGame";
import QuizGame from "./QuizGame";
import { VisualGameTemplate } from "@/utils/visualGameTypes";

interface VisualGamePlayerProps {
  game: VisualGameTemplate;
  onClose: () => void;
  onComplete?: (score: number, maxScore: number) => void;
}

const VisualGamePlayer = ({ game, onClose, onComplete }: VisualGamePlayerProps) => {
  const handleComplete = (score: number, maxScore: number) => {
    if (onComplete) {
      onComplete(score, maxScore);
    }
  };

  const renderGame = () => {
    const commonProps = {
      difficulty: game.difficulty,
      subject: game.subjects?.[0] || "General",
      onComplete: handleComplete,
      onClose: onClose,
    };

    switch (game.gameType) {
      case "word-scramble":
        return <WordScrambleGame {...commonProps} />;
      
      case "matching-pairs":
        return <MatchingPairsGame {...commonProps} />;
      
      case "memory-cards":
        return <MemoryCardsGame {...commonProps} />;
      
      case "pattern-recognition":
        return <PatternRecognitionGame {...commonProps} />;
      
      case "quiz":
        return <QuizGame {...commonProps} />;
      
      // Placeholder for other game types
      case "drag-drop":
      case "fill-blanks":
      case "puzzle":
      case "sorting":
        return (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="text-6xl mb-4">{game.emoji}</div>
            <h2 className="text-3xl font-bold">{game.title}</h2>
            <p className="text-lg text-muted-foreground max-w-md">
              {game.description}
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
              <p className="text-yellow-700 dark:text-yellow-400 font-medium">
                🚧 Coming Soon! This game is under development.
              </p>
            </div>
            <Button onClick={onClose} size="lg" className="mt-6">
              Back to Games
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              Game type not supported yet.
            </p>
            <Button onClick={onClose}>Back to Games</Button>
          </div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="visual-game-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto"
      >
        <div className="min-h-screen p-4 md:p-8">
          {/* Close Button */}
          <div className="flex justify-end mb-4">
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Game Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            {renderGame()}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VisualGamePlayer;
