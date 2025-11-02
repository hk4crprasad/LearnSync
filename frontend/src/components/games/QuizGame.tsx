import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { HelpCircle, Trophy, Star, Check, X, ArrowRight, XCircle } from "lucide-react";

interface QuizGameProps {
  difficulty: "Easy" | "Medium" | "Hard";
  subject?: string;
  onComplete: (score: number, maxScore: number) => void;
  onClose: () => void;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QuizGame = ({ difficulty, subject = "General", onComplete, onClose }: QuizGameProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const pointsPerQuestion = 10;
  // Fewer questions for younger children - Easy mode optimized for 6-9 year olds
  const totalQuestions = difficulty === "Easy" ? 6 : difficulty === "Medium" ? 8 : 6;

  useEffect(() => {
    generateQuestions();
  }, [difficulty, subject]);

  const generateQuestions = () => {
    const questionBank: Record<string, Record<string, Question[]>> = {
      Environment: {
        Easy: [
          {
            question: "What do trees produce that we breathe?",
            options: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
            correctAnswer: 1,
            explanation: "Trees produce oxygen through photosynthesis, which is essential for us to breathe!"
          },
          {
            question: "Which of these helps the environment?",
            options: ["Littering", "Recycling", "Wasting water", "Pollution"],
            correctAnswer: 1,
            explanation: "Recycling helps reduce waste and protects our environment!"
          },
          {
            question: "What is the main source of energy for Earth?",
            options: ["Moon", "Stars", "Sun", "Wind"],
            correctAnswer: 2,
            explanation: "The Sun provides energy for plants, weather, and life on Earth!"
          }
        ],
        Medium: [
          {
            question: "What is the greenhouse effect?",
            options: ["Plants growing in houses", "Trapping heat in atmosphere", "Green colored houses", "Growing vegetables"],
            correctAnswer: 1,
            explanation: "Greenhouse effect is when gases trap heat in Earth's atmosphere, warming the planet."
          },
          {
            question: "Which gas is most responsible for climate change?",
            options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"],
            correctAnswer: 2,
            explanation: "CO2 from burning fossil fuels is the main driver of climate change."
          }
        ],
        Hard: [
          {
            question: "What is biodiversity?",
            options: ["Study of biology", "Variety of life forms", "Bio-degradable materials", "Diverse biomes"],
            correctAnswer: 1,
            explanation: "Biodiversity refers to the variety of all living organisms in an ecosystem."
          }
        ]
      },
      Agriculture: {
        Easy: [
          {
            question: "What do plants need to grow?",
            options: ["Only water", "Only sunlight", "Water, sunlight, and soil", "Only soil"],
            correctAnswer: 2,
            explanation: "Plants need water, sunlight, and nutrients from soil to grow healthy!"
          },
          {
            question: "Which season is best for planting most crops?",
            options: ["Winter", "Spring", "Summer", "All seasons"],
            correctAnswer: 1,
            explanation: "Spring is ideal for planting as temperatures warm and rain helps seeds grow!"
          }
        ],
        Medium: [
          {
            question: "What is crop rotation?",
            options: ["Turning crops", "Growing different crops in sequence", "Rotating while harvesting", "Seasonal farming"],
            correctAnswer: 1,
            explanation: "Crop rotation improves soil health by alternating different crops each season."
          }
        ],
        Hard: [
          {
            question: "What is sustainable agriculture?",
            options: ["Fast farming", "Farming that protects resources for future", "Organic only", "Traditional methods"],
            correctAnswer: 1,
            explanation: "Sustainable agriculture meets current needs while preserving resources for future generations."
          }
        ]
      },
      Technology: {
        Easy: [
          {
            question: "What does CPU stand for?",
            options: ["Computer Personal Unit", "Central Processing Unit", "Central Program Utility", "Computer Power Unit"],
            correctAnswer: 1,
            explanation: "CPU is the 'brain' of the computer that processes all instructions!"
          },
          {
            question: "What do we use to move the cursor on screen?",
            options: ["Keyboard", "Monitor", "Mouse", "Speaker"],
            correctAnswer: 2,
            explanation: "A mouse helps us point, click, and navigate on the computer screen!"
          }
        ],
        Medium: [
          {
            question: "What is artificial intelligence?",
            options: ["Fake intelligence", "Machines that can learn and think", "Robot intelligence", "Computer games"],
            correctAnswer: 1,
            explanation: "AI enables machines to learn from data and make intelligent decisions!"
          }
        ],
        Hard: [
          {
            question: "What is blockchain technology?",
            options: ["Chain of blocks", "Distributed ledger system", "Block building", "Chain network"],
            correctAnswer: 1,
            explanation: "Blockchain is a secure, distributed database system used for transparent record-keeping."
          }
        ]
      },
      Math: {
        Easy: [
          {
            question: "What is 5 + 7?",
            options: ["10", "11", "12", "13"],
            correctAnswer: 2,
            explanation: "5 + 7 = 12. You can count: 5, 6, 7, 8, 9, 10, 11, 12!"
          },
          {
            question: "How many sides does a triangle have?",
            options: ["2", "3", "4", "5"],
            correctAnswer: 1,
            explanation: "A triangle has 3 sides and 3 corners!"
          }
        ],
        Medium: [
          {
            question: "What is the value of π (pi) approximately?",
            options: ["2.14", "3.14", "4.14", "5.14"],
            correctAnswer: 1,
            explanation: "Pi (π) is approximately 3.14159, used in circle calculations!"
          }
        ],
        Hard: [
          {
            question: "What is the derivative of x²?",
            options: ["x", "2x", "x²", "2"],
            correctAnswer: 1,
            explanation: "Using power rule: d/dx(x²) = 2x¹ = 2x"
          }
        ]
      },
      Science: {
        Easy: [
          {
            question: "What planet do we live on?",
            options: ["Mars", "Venus", "Earth", "Jupiter"],
            correctAnswer: 2,
            explanation: "We live on Earth, the third planet from the Sun!"
          }
        ],
        Medium: [
          {
            question: "What is photosynthesis?",
            options: ["Animals breathing", "Plants making food from sunlight", "Water cycle", "Light reflection"],
            correctAnswer: 1,
            explanation: "Photosynthesis is how plants convert sunlight into food (glucose)!"
          }
        ],
        Hard: [
          {
            question: "What is the atomic number of carbon?",
            options: ["4", "6", "8", "12"],
            correctAnswer: 1,
            explanation: "Carbon has atomic number 6, meaning 6 protons in its nucleus."
          }
        ]
      },
      Teamwork: {
        Easy: [
          {
            question: "What makes a good team member?",
            options: ["Working alone", "Listening and helping others", "Doing everything yourself", "Ignoring others"],
            correctAnswer: 1,
            explanation: "Good team members listen, communicate, and help each other succeed!"
          }
        ],
        Medium: [
          {
            question: "What is collaboration?",
            options: ["Working independently", "Working together toward a goal", "Competition", "Individual effort"],
            correctAnswer: 1,
            explanation: "Collaboration is when people work together, combining skills to achieve goals!"
          }
        ],
        Hard: [
          {
            question: "What is the most important aspect of teamwork?",
            options: ["Speed", "Communication", "Individual talent", "Competition"],
            correctAnswer: 1,
            explanation: "Clear communication is the foundation of effective teamwork and collaboration."
          }
        ]
      },
      General: {
        Easy: [
          {
            question: "What comes after Monday?",
            options: ["Sunday", "Tuesday", "Wednesday", "Friday"],
            correctAnswer: 1,
            explanation: "Tuesday follows Monday in the week!"
          }
        ],
        Medium: [
          {
            question: "What is critical thinking?",
            options: ["Thinking critically of others", "Analyzing information carefully", "Quick thinking", "Creative thinking"],
            correctAnswer: 1,
            explanation: "Critical thinking means analyzing information objectively to make informed decisions."
          }
        ],
        Hard: [
          {
            question: "What is metacognition?",
            options: ["Thinking about thinking", "Meta data", "Cognitive decline", "Memory loss"],
            correctAnswer: 0,
            explanation: "Metacognition is awareness and understanding of your own thought processes."
          }
        ]
      }
    };

    const selectedBank = questionBank[subject] || questionBank.General;
    const difficultyQuestions = selectedBank[difficulty] || selectedBank.Easy;
    
    // If not enough questions, repeat and shuffle
    const allQuestions = [...difficultyQuestions];
    while (allQuestions.length < totalQuestions) {
      allQuestions.push(...difficultyQuestions);
    }
    
    const shuffled = allQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, totalQuestions);

    setQuestions(shuffled);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const isCorrect = answerIndex === questions[currentIndex].correctAnswer;

    if (isCorrect) {
      setScore(score + pointsPerQuestion);
      toast.success("Correct! 🎉", { 
        description: `+${pointsPerQuestion} points`
      });
    } else {
      toast.error("Incorrect", {
        description: questions[currentIndex].explanation
      });
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setGameComplete(true);
      onComplete(score + (isAnswered && selectedAnswer === questions[currentIndex].correctAnswer ? pointsPerQuestion : 0), questions.length * pointsPerQuestion);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (gameComplete) {
    const percentage = Math.round((score / (questions.length * pointsPerQuestion)) * 100);
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center space-y-6"
      >
        <Trophy className="h-24 w-24 text-yellow-500" />
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Quiz Complete!</h2>
        <div className="space-y-2">
          <p className="text-2xl font-semibold text-primary">
            Score: {score} / {questions.length * pointsPerQuestion}
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

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Challenge</h2>
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
            <span className="text-slate-700 dark:text-slate-200">Question {currentIndex + 1} of {questions.length}</span>
            <span className="text-blue-600 dark:text-blue-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showResult = isAnswered;

                let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all ";
                
                if (showResult) {
                  if (isCorrect) {
                    buttonClass += "bg-green-500/20 border-green-500 ";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += "bg-red-500/20 border-red-500 ";
                  } else {
                    buttonClass += "border-muted ";
                  }
                } else {
                  buttonClass += "hover:border-primary hover:bg-primary/5 border-muted cursor-pointer ";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                    className={buttonClass}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${
                        showResult && isCorrect ? "bg-green-500 text-white" :
                        showResult && isSelected && !isCorrect ? "bg-red-500 text-white" :
                        "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                      }`}>
                        {showResult && isCorrect ? <Check className="h-5 w-5" /> :
                         showResult && isSelected && !isCorrect ? <X className="h-5 w-5" /> :
                         String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{option}</span>
                    </div>
                  </button>
                );
              })}

              {/* Explanation */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4"
                >
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    <span className="font-bold">💡 Explanation: </span>
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}

              {/* Next Button */}
              {isAnswered && (
                <Button 
                  onClick={handleNext}
                  className="w-full mt-4"
                  size="lg"
                >
                  {currentIndex + 1 >= questions.length ? "Finish Quiz" : "Next Question"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizGame;
