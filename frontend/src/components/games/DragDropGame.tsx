import { useState, useEffect } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, GripVertical, RotateCcw } from "lucide-react";
import { VisualGameTemplate } from "@/utils/visualGameTypes";

interface DragDropGameProps {
  game: VisualGameTemplate;
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface SequenceItem {
  id: number;
  text: string;
  correctOrder: number;
  emoji: string;
}

export const DragDropGame = ({ game, onComplete, onClose }: DragDropGameProps) => {
  const [items, setItems] = useState<SequenceItem[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Different sequences based on subject
  const sequences: Record<string, SequenceItem[]> = {
    Agriculture: [
      { id: 1, text: "Prepare the soil", correctOrder: 1, emoji: "🌱" },
      { id: 2, text: "Plant the seeds", correctOrder: 2, emoji: "🌾" },
      { id: 3, text: "Water regularly", correctOrder: 3, emoji: "💧" },
      { id: 4, text: "Remove weeds", correctOrder: 4, emoji: "🌿" },
      { id: 5, text: "Harvest crops", correctOrder: 5, emoji: "🚜" },
      { id: 6, text: "Store produce", correctOrder: 6, emoji: "🏠" },
    ],
    Technology: [
      { id: 1, text: "Define the problem", correctOrder: 1, emoji: "🤔" },
      { id: 2, text: "Plan the solution", correctOrder: 2, emoji: "📝" },
      { id: 3, text: "Write the code", correctOrder: 3, emoji: "💻" },
      { id: 4, text: "Test the program", correctOrder: 4, emoji: "🧪" },
      { id: 5, text: "Fix bugs", correctOrder: 5, emoji: "🐛" },
      { id: 6, text: "Deploy application", correctOrder: 6, emoji: "🚀" },
    ],
    Storytelling: [
      { id: 1, text: "Once upon a time", correctOrder: 1, emoji: "📖" },
      { id: 2, text: "Main character introduced", correctOrder: 2, emoji: "🦸" },
      { id: 3, text: "Problem arises", correctOrder: 3, emoji: "⚡" },
      { id: 4, text: "Journey begins", correctOrder: 4, emoji: "🗺️" },
      { id: 5, text: "Climax moment", correctOrder: 5, emoji: "🎭" },
      { id: 6, text: "Happy ending", correctOrder: 6, emoji: "🌟" },
    ],
    English: [
      { id: 1, text: "Once upon a time", correctOrder: 1, emoji: "📚" },
      { id: 2, text: "Character meets challenge", correctOrder: 2, emoji: "⚔️" },
      { id: 3, text: "Hero takes action", correctOrder: 3, emoji: "🦸‍♂️" },
      { id: 4, text: "Conflict intensifies", correctOrder: 4, emoji: "💥" },
      { id: 5, text: "Resolution occurs", correctOrder: 5, emoji: "✨" },
      { id: 6, text: "Story concludes", correctOrder: 6, emoji: "🎬" },
    ],
    Science: [
      { id: 1, text: "Ask a question", correctOrder: 1, emoji: "❓" },
      { id: 2, text: "Research the topic", correctOrder: 2, emoji: "📚" },
      { id: 3, text: "Form hypothesis", correctOrder: 3, emoji: "💡" },
      { id: 4, text: "Conduct experiment", correctOrder: 4, emoji: "🔬" },
      { id: 5, text: "Analyze data", correctOrder: 5, emoji: "📊" },
      { id: 6, text: "Draw conclusion", correctOrder: 6, emoji: "✅" },
    ],
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Get sequence based on subject
    const subject = game.subjects[0] || "Science";
    let sequence = sequences[subject] || sequences.Science;

    // Limit items based on difficulty
    const itemCount = game.difficulty === "Easy" ? 4 : game.difficulty === "Medium" ? 5 : 6;
    sequence = sequence.slice(0, itemCount);

    // Shuffle the sequence
    const shuffled = [...sequence].sort(() => Math.random() - 0.5);
    
    setItems(shuffled);
    setScore(0);
    setAttempts(0);
    setIsComplete(false);
    setShowFeedback(false);
  };

  const checkOrder = () => {
    setAttempts(attempts + 1);
    
    // Check if all items are in correct order
    const isCorrect = items.every((item, index) => item.correctOrder === index + 1);

    if (isCorrect) {
      const finalScore = Math.max(
        game.pointsPerCorrect,
        Math.floor(game.maxPoints - (attempts * 10))
      );
      setScore(finalScore);
      setIsComplete(true);
      setShowFeedback(true);

      setTimeout(() => {
        onComplete(finalScore);
      }, 2000);
    } else {
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1500);
    }
  };

  const isItemCorrect = (item: SequenceItem, index: number) => {
    return item.correctOrder === index + 1;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${game.color} p-6 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{game.emoji}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">{game.title}</h2>
                <p className="text-white/90 text-sm">{game.instructions}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mt-4">
            <Badge className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 px-4 py-2">
              Attempts: <span className="font-bold ml-1">{attempts}</span>
            </Badge>
            <Badge className="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-2 px-4 py-2">
              Score: <span className="font-bold ml-1">{score}</span>
            </Badge>
          </div>
        </div>

        {/* Game Content */}
        <div className="p-6">
          {!isComplete ? (
            <div className="space-y-4">
              <p className="text-slate-700 dark:text-slate-200 text-center font-medium">
                Drag items to arrange them in the correct order!
              </p>

              {/* Feedback Message */}
              <AnimatePresence>
                {showFeedback && !isComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg text-center font-semibold"
                  >
                    ❌ Not quite right! Try again!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Draggable List */}
              <Reorder.Group
                axis="y"
                values={items}
                onReorder={setItems}
                className="space-y-3"
              >
                {items.map((item, index) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    className={`
                      bg-gradient-to-r from-slate-100 to-slate-200 
                      dark:from-slate-700 dark:to-slate-600
                      rounded-xl p-4 cursor-grab active:cursor-grabbing
                      shadow-md hover:shadow-lg transition-shadow
                      ${showFeedback && isItemCorrect(item, index) ? "ring-2 ring-green-500" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="text-slate-400 h-6 w-6 flex-shrink-0" />
                      <div className="text-3xl">{item.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500 text-white">
                            {index + 1}
                          </Badge>
                          <span className="text-slate-800 dark:text-slate-100 font-semibold">
                            {item.text}
                          </span>
                        </div>
                      </div>
                      {showFeedback && isItemCorrect(item, index) && (
                        <Check className="text-green-500 h-6 w-6" />
                      )}
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center mt-6">
                <Button
                  onClick={checkOrder}
                  className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
                >
                  <Check className="h-4 w-4" />
                  Check Order
                </Button>
                <Button onClick={initializeGame} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                Perfect Order!
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Completed in {attempts} {attempts === 1 ? "attempt" : "attempts"}!
              </p>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                +{score} points
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
