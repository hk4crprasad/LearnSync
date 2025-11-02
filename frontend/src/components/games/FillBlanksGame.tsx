import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Check, RotateCcw, Lightbulb } from "lucide-react";
import { VisualGameTemplate } from "@/utils/visualGameTypes";

interface FillBlanksGameProps {
  game: VisualGameTemplate;
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface Sentence {
  id: number;
  text: string;
  blank: string;
  hint: string;
  emoji: string;
}

export const FillBlanksGame = ({ game, onComplete, onClose }: FillBlanksGameProps) => {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Sentences for different subjects
  const allSentences: Record<string, Sentence[]> = {
    English: [
      { id: 1, text: "The cat is _____ on the mat.", blank: "sitting", hint: "What does the cat do?", emoji: "🐱" },
      { id: 2, text: "She _____ to school every day.", blank: "walks", hint: "How does she get to school?", emoji: "🚶‍♀️" },
      { id: 3, text: "The sun _____ in the east.", blank: "rises", hint: "What does the sun do in the morning?", emoji: "☀️" },
      { id: 4, text: "We _____ our homework yesterday.", blank: "finished", hint: "What did we do with homework?", emoji: "📚" },
      { id: 5, text: "The dog is _____ loudly.", blank: "barking", hint: "What sound does a dog make?", emoji: "🐕" },
      { id: 6, text: "Birds _____ in the sky.", blank: "fly", hint: "How do birds move?", emoji: "🦅" },
      { id: 7, text: "The baby is _____ peacefully.", blank: "sleeping", hint: "What does a baby do at night?", emoji: "👶" },
      { id: 8, text: "I _____ my friend at the park.", blank: "met", hint: "What did I do with my friend?", emoji: "👋" },
    ],
    Science: [
      { id: 1, text: "Plants make food through _____.", blank: "photosynthesis", hint: "Process using sunlight", emoji: "🌿" },
      { id: 2, text: "Water boils at 100 degrees _____.", blank: "celsius", hint: "Temperature unit", emoji: "🌡️" },
      { id: 3, text: "The Earth _____ around the Sun.", blank: "revolves", hint: "What does Earth do around Sun?", emoji: "🌍" },
      { id: 4, text: "_____ is the force that pulls objects down.", blank: "gravity", hint: "Force discovered by Newton", emoji: "🍎" },
      { id: 5, text: "Animals that eat plants are called _____.", blank: "herbivores", hint: "Type of animal diet", emoji: "🦌" },
      { id: 6, text: "The human body has 206 _____.", blank: "bones", hint: "Parts of skeleton", emoji: "🦴" },
    ],
    Storytelling: [
      { id: 1, text: "The hero _____ the dragon bravely.", blank: "fought", hint: "What did the hero do?", emoji: "⚔️" },
      { id: 2, text: "The princess lived in a tall _____.", blank: "castle", hint: "Where does a princess live?", emoji: "🏰" },
      { id: 3, text: "The magic wand _____ brightly.", blank: "glowed", hint: "What did the wand do?", emoji: "✨" },
      { id: 4, text: "They lived _____ ever after.", blank: "happily", hint: "Classic ending phrase", emoji: "💕" },
      { id: 5, text: "The wizard cast a powerful _____.", blank: "spell", hint: "What does a wizard cast?", emoji: "🧙" },
      { id: 6, text: "The treasure was _____ in a cave.", blank: "hidden", hint: "Where was the treasure?", emoji: "💎" },
    ],
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const subject = game.subjects[0] || "English";
    let availableSentences = allSentences[subject] || allSentences.English;

    // Select sentences based on difficulty
    const count = game.difficulty === "Easy" ? 4 : game.difficulty === "Medium" ? 6 : 8;
    const selected = [...availableSentences]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    setSentences(selected);
    setCurrentIndex(0);
    setUserAnswer("");
    setScore(0);
    setCorrectCount(0);
    setIsComplete(false);
    setFeedback(null);
    setShowHint(false);
  };

  const checkAnswer = () => {
    const currentSentence = sentences[currentIndex];
    const isCorrect =
      userAnswer.toLowerCase().trim() === currentSentence.blank.toLowerCase();

    if (isCorrect) {
      const points = showHint ? Math.floor(game.pointsPerCorrect * 0.5) : game.pointsPerCorrect;
      setScore(score + points);
      setCorrectCount(correctCount + 1);
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ The correct answer is: ${currentSentence.blank}`);
    }

    setTimeout(() => {
      if (currentIndex < sentences.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setUserAnswer("");
        setFeedback(null);
        setShowHint(false);
      } else {
        setIsComplete(true);
        setTimeout(() => {
          onComplete(score);
        }, 2000);
      }
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userAnswer.trim()) {
      checkAnswer();
    }
  };

  const currentSentence = sentences[currentIndex];

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
              Question: <span className="font-bold ml-1">{currentIndex + 1}/{sentences.length}</span>
            </Badge>
            <Badge className="bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 border-2 px-4 py-2">
              Correct: <span className="font-bold ml-1">{correctCount}</span>
            </Badge>
            <Badge className="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-2 px-4 py-2">
              Score: <span className="font-bold ml-1">{score}</span>
            </Badge>
          </div>
        </div>

        {/* Game Content */}
        <div className="p-6">
          {!isComplete && currentSentence ? (
            <div className="space-y-6">
              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-center p-3 rounded-lg font-semibold ${
                      feedback.includes("✅")
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {feedback}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sentence with emoji */}
              <div className="text-center">
                <div className="text-6xl mb-4">{currentSentence.emoji}</div>
                <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6">
                  <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                    {currentSentence.text.split("_____")[0]}
                    <span className="inline-block mx-2 px-4 py-1 bg-blue-500 text-white rounded-lg">
                      _____
                    </span>
                    {currentSentence.text.split("_____")[1]}
                  </p>
                </div>
              </div>

              {/* Hint */}
              {showHint && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 p-3 rounded-lg text-center"
                >
                  💡 Hint: {currentSentence.hint}
                </motion.div>
              )}

              {/* Input */}
              <div className="space-y-3">
                <Input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  className="text-lg p-6 text-center"
                  disabled={!!feedback}
                  autoFocus
                />

                {/* Buttons */}
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={checkAnswer}
                    disabled={!userAnswer.trim() || !!feedback}
                    className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Check Answer
                  </Button>
                  <Button
                    onClick={() => setShowHint(true)}
                    disabled={showHint || !!feedback}
                    variant="outline"
                    className="gap-2"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Show Hint
                  </Button>
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex justify-center mt-4">
                <Button onClick={initializeGame} variant="ghost" className="gap-2 text-slate-500">
                  <RotateCcw className="h-4 w-4" />
                  Restart Game
                </Button>
              </div>
            </div>
          ) : isComplete ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                Well Done!
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                You got {correctCount} out of {sentences.length} correct!
              </p>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                +{score} points
              </div>
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};
