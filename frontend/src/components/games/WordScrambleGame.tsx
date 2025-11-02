import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Shuffle, Check, X, Trophy, Star, ArrowRight, XCircle } from "lucide-react";

interface WordScrambleGameProps {
  difficulty: "Easy" | "Medium" | "Hard";
  subject?: string;
  onComplete: (score: number, maxScore: number) => void;
  onClose: () => void;
}

interface WordPuzzle {
  word: string;
  hint: string;
  scrambled: string;
}

const WordScrambleGame = ({ difficulty, subject = "General", onComplete, onClose }: WordScrambleGameProps) => {
  const [words, setWords] = useState<WordPuzzle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameComplete, setGameComplete] = useState(false);

  const pointsPerWord = 10;
  // Adjust number of words based on difficulty - fewer for younger children
  const totalWords = difficulty === "Easy" ? 8 : difficulty === "Medium" ? 8 : 6;

  useEffect(() => {
    generateWords();
  }, [difficulty, subject]);

  const generateWords = () => {
    const wordLists: Record<string, { Easy: string[][]; Medium: string[][]; Hard: string[][] }> = {
      Science: {
        Easy: [
          ["PLANT", "Living thing that makes food from sunlight"],
          ["WATER", "Liquid we drink every day"],
          ["EARTH", "The planet we live on"],
          ["LIGHT", "Energy that helps us see"],
          ["SOUND", "What we hear with our ears"],
          ["ANIMAL", "Living creature that moves around"],
          ["CLOUD", "White fluffy thing in the sky"],
          ["ROCKS", "Hard natural materials from ground"],
          ["SOLAR", "Related to the sun"],
          ["OXYGEN", "Gas we breathe to live"]
        ],
        Medium: [
          ["GRAVITY", "Force that pulls things down"],
          ["ENERGY", "Power to do work"],
          ["CIRCUIT", "Complete path for electricity"],
          ["PHOTON", "Particle of light"],
          ["NEUTRON", "Neutral particle in atom"],
          ["MOLECULE", "Two or more atoms bonded"],
          ["FRICTION", "Force that opposes motion"],
          ["VELOCITY", "Speed with direction"]
        ],
        Hard: [
          ["PHOTOSYNTHESIS", "Process plants make food"],
          ["ELECTROMAGNETIC", "Type of wave or force"],
          ["CHROMOSOME", "DNA structure in cells"],
          ["ECOSYSTEM", "Community of living things"],
          ["METABOLISM", "Chemical processes in body"],
          ["HYPOTHESIS", "Scientific prediction to test"]
        ]
      },
      Mathematics: {
        Easy: [
          ["NUMBER", "Symbol for counting"],
          ["CIRCLE", "Round shape with no corners"],
          ["SQUARE", "Shape with four equal sides"],
          ["ADDITION", "Putting numbers together"],
          ["PATTERN", "Repeated design or sequence"],
          ["TRIANGLE", "Shape with three sides"],
          ["FRACTION", "Part of a whole number"],
          ["GRAPH", "Picture showing data"],
          ["ANGLE", "Space between two lines"],
          ["EQUAL", "Same as or identical to"]
        ],
        Medium: [
          ["ALGEBRA", "Math with letters and numbers"],
          ["EQUATION", "Math statement with equals"],
          ["GEOMETRY", "Study of shapes and space"],
          ["PERIMETER", "Distance around a shape"],
          ["DIAMETER", "Line across circle through center"],
          ["QUOTIENT", "Result of division"],
          ["VARIABLE", "Letter representing a number"],
          ["PARALLEL", "Lines that never meet"]
        ],
        Hard: [
          ["POLYNOMIAL", "Expression with multiple terms"],
          ["TRIGONOMETRY", "Study of triangles"],
          ["LOGARITHM", "Inverse of exponentiation"],
          ["DERIVATIVE", "Rate of change in calculus"],
          ["INTEGRAL", "Area under curve"],
          ["COEFFICIENT", "Number multiplying variable"]
        ]
      },
      English: {
        Easy: [
          ["STORY", "Tale with beginning and end"],
          ["LETTER", "Symbol representing a sound"],
          ["SENTENCE", "Group of words expressing idea"],
          ["RHYME", "Words with similar sounds"],
          ["VOWEL", "Letters A, E, I, O, U"],
          ["CAPITAL", "Uppercase letter"],
          ["COMMA", "Punctuation mark for pause"],
          ["PERIOD", "Dot ending a sentence"],
          ["QUESTION", "Sentence asking something"],
          ["WORD", "Unit of language"]
        ],
        Medium: [
          ["METAPHOR", "Comparison without like or as"],
          ["ADJECTIVE", "Word describing noun"],
          ["PARAGRAPH", "Group of related sentences"],
          ["SYNONYM", "Word with similar meaning"],
          ["ANTONYM", "Word with opposite meaning"],
          ["PRONOUN", "Word replacing noun"],
          ["QUOTATION", "Someone's exact words"],
          ["DIALOGUE", "Conversation between people"]
        ],
        Hard: [
          ["ALLITERATION", "Same sound at word starts"],
          ["ONOMATOPOEIA", "Word that sounds like action"],
          ["PERSONIFICATION", "Giving human traits to things"],
          ["SUBORDINATE", "Dependent clause"],
          ["CONJUNCTION", "Word connecting clauses"],
          ["PREPOSITION", "Word showing relationship"]
        ]
      },
      General: {
        Easy: [
          ["HAPPY", "Feeling of joy"],
          ["FRIEND", "Someone you like and trust"],
          ["FAMILY", "People related to you"],
          ["SCHOOL", "Place to learn"],
          ["BOOK", "Pages with words to read"],
          ["GAME", "Activity for fun"],
          ["MUSIC", "Sounds in rhythm"],
          ["COLOR", "What makes things look different"],
          ["SMILE", "Happy face expression"],
          ["DREAM", "Thoughts while sleeping"]
        ],
        Medium: [
          ["CREATIVE", "Using imagination"],
          ["KNOWLEDGE", "What you know and understand"],
          ["CHALLENGE", "Difficult task to overcome"],
          ["IMAGINE", "Picture in your mind"],
          ["DISCOVER", "Find something new"],
          ["PRACTICE", "Doing to get better"],
          ["EXPLORE", "Search and discover"],
          ["RESPECT", "Treating others well"]
        ],
        Hard: [
          ["PERSEVERANCE", "Never giving up"],
          ["ENTHUSIASM", "Strong excitement"],
          ["CURIOSITY", "Desire to learn"],
          ["RESPONSIBILITY", "Being accountable"],
          ["COOPERATION", "Working together"],
          ["ACHIEVEMENT", "Successful accomplishment"]
        ]
      }
    };

    const selectedList = wordLists[subject] || wordLists.General;
    const difficultyWords = selectedList[difficulty] || selectedList.Easy;
    
    const shuffledWords = [...difficultyWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalWords)
      .map(([word, hint]) => ({
        word,
        hint,
        scrambled: scrambleWord(word)
      }));

    setWords(shuffledWords);
  };

  const scrambleWord = (word: string): string => {
    const arr = word.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const scrambled = arr.join("");
    return scrambled === word ? scrambleWord(word) : scrambled;
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      toast.error("Please enter your answer!");
      return;
    }

    const correct = userAnswer.toUpperCase() === words[currentIndex].word;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + pointsPerWord);
      toast.success("Correct! 🎉", { description: `+${pointsPerWord} points` });
    } else {
      toast.error(`Wrong! The answer was: ${words[currentIndex].word}`);
    }

    setTimeout(() => {
      if (currentIndex + 1 >= words.length) {
        setGameComplete(true);
        onComplete(score + (correct ? pointsPerWord : 0), words.length * pointsPerWord);
      } else {
        setCurrentIndex(currentIndex + 1);
        setUserAnswer("");
        setIsCorrect(null);
      }
    }, 1500);
  };

  const handleSkip = () => {
    if (currentIndex + 1 >= words.length) {
      setGameComplete(true);
      onComplete(score, words.length * pointsPerWord);
    } else {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setIsCorrect(null);
    }
  };

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (gameComplete) {
    const percentage = Math.round((score / (words.length * pointsPerWord)) * 100);
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center space-y-6"
      >
        <Trophy className="h-24 w-24 text-yellow-500" />
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Game Complete!</h2>
        <div className="space-y-2">
          <p className="text-2xl font-semibold text-primary">
            Score: {score} / {words.length * pointsPerWord}
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {percentage}% Correct
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => window.location.reload()} size="lg">
            Play Again
          </Button>
          <Button onClick={onClose} variant="outline" size="lg">
            Back to Dashboard
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shuffle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Word Scramble</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg px-4 py-2 bg-white dark:bg-slate-800 border-2 font-semibold">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              <span className="text-blue-600 dark:text-blue-400">{score} pts</span>
            </Badge>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-slate-700 dark:text-slate-200">Question {currentIndex + 1} of {words.length}</span>
            <span className="text-blue-600 dark:text-blue-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Game Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-center text-lg font-bold text-slate-800 dark:text-slate-100">
                Unscramble this word:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              {/* Scrambled Word */}
              <div className="text-center">
                <div className="text-5xl font-bold tracking-wider text-primary mb-4 font-mono drop-shadow-sm">
                  {currentWord.scrambled}
                </div>
                <p className="text-lg font-medium text-slate-700 dark:text-slate-200 italic">
                  💡 Hint: {currentWord.hint}
                </p>
              </div>

              {/* Input */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 text-xl text-center border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase tracking-wider font-semibold"
                  autoFocus
                  disabled={isCorrect !== null}
                />

                {/* Feedback */}
                <AnimatePresence>
                  {isCorrect !== null && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                        isCorrect
                          ? "bg-green-500/10 text-green-600"
                          : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <Check className="h-5 w-5" />
                          <span className="font-semibold">Correct!</span>
                        </>
                      ) : (
                        <>
                          <X className="h-5 w-5" />
                          <span className="font-semibold">
                            Wrong! The answer was: {currentWord.word}
                          </span>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  size="lg"
                  disabled={isCorrect !== null || !userAnswer.trim()}
                >
                  Check Answer
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  size="lg"
                  disabled={isCorrect !== null}
                >
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WordScrambleGame;
