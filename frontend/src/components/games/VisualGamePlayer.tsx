import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import WordScrambleGame from "./WordScrambleGame";
import MatchingPairsGame from "./MatchingPairsGame";
import MemoryCardsGame from "./MemoryCardsGame";
import PatternRecognitionGame from "./PatternRecognitionGame";
import QuizGame from "./QuizGame";
import { PuzzleGame } from "./PuzzleGame";
import { SortingGame } from "./SortingGame";
import { DragDropGame } from "./DragDropGame";
import { FillBlanksGame } from "./FillBlanksGame";
import { VisualGameTemplate } from "@/utils/visualGameTypes";

interface VisualGamePlayerProps {
  game: VisualGameTemplate;
  onClose: () => void;
  onComplete?: (score: number, maxScore: number) => void;
}

const VisualGamePlayer = ({ game, onClose, onComplete }: VisualGamePlayerProps) => {
  console.log("VisualGamePlayer component rendered with game:", game);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  const handleComplete = (score: number) => {
    if (onComplete) {
      onComplete(score, game.maxPoints);
    }
  };

  const renderGame = () => {
    const commonProps = {
      game: game,
      onComplete: handleComplete,
      onClose: onClose,
    };

    switch (game.gameType) {
      case "word-scramble":
        return <WordScrambleGame 
          difficulty={game.difficulty}
          subject={game.subjects?.[0] || "General"}
          onComplete={(score, maxScore) => onComplete?.(score, maxScore)}
          onClose={onClose}
        />;
      
      case "matching-pairs":
        return <MatchingPairsGame 
          difficulty={game.difficulty}
          subject={game.subjects?.[0] || "General"}
          onComplete={(score, maxScore) => onComplete?.(score, maxScore)}
          onClose={onClose}
        />;
      
      case "memory-cards":
        return <MemoryCardsGame 
          difficulty={game.difficulty}
          subject={game.subjects?.[0] || "General"}
          onComplete={(score, maxScore) => onComplete?.(score, maxScore)}
          onClose={onClose}
        />;
      
      case "pattern-recognition":
        return <PatternRecognitionGame 
          difficulty={game.difficulty}
          subject={game.subjects?.[0] || "General"}
          onComplete={(score, maxScore) => onComplete?.(score, maxScore)}
          onClose={onClose}
        />;
      
      case "quiz":
        return <QuizGame 
          difficulty={game.difficulty}
          subject={game.subjects?.[0] || "General"}
          onComplete={(score, maxScore) => onComplete?.(score, maxScore)}
          onClose={onClose}
        />;
      
      // NEW PERSONALIZED GAMES
      case "puzzle":
        return <PuzzleGame {...commonProps} />;
      
      case "sorting":
        return <SortingGame {...commonProps} />;
      
      case "drag-drop":
        return <DragDropGame {...commonProps} />;
      
      case "fill-blanks":
        return <FillBlanksGame {...commonProps} />;
      
      default:
        return (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <p className="text-lg text-gray-700 dark:text-gray-300">
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
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm overflow-y-auto"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
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
