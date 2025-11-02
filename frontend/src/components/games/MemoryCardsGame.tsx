import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Brain, Trophy, Star, Timer } from "lucide-react";

interface MemoryCardsGameProps {
  difficulty: "Easy" | "Medium" | "Hard";
  subject?: string;
  onComplete: (score: number, maxScore: number) => void;
  onClose: () => void;
}

interface Card {
  id: number;
  content: string;
  emoji: string;
  matched: boolean;
  flipped: boolean;
}

const MemoryCardsGame = ({ difficulty, subject = "General", onComplete, onClose }: MemoryCardsGameProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const pointsPerMatch = 20;
  const totalPairs = difficulty === "Easy" ? 6 : difficulty === "Medium" ? 8 : 10;

  useEffect(() => {
    generateCards();
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [difficulty, subject]);

  const generateCards = () => {
    const cardSets: Record<string, Record<string, string[][]>> = {
      Science: {
        Easy: [
          ["🌞", "Sun"], ["🌙", "Moon"], ["⭐", "Star"],
          ["🌍", "Earth"], ["💧", "Water"], ["🌱", "Plant"]
        ],
        Medium: [
          ["🔬", "Microscope"], ["🧪", "Chemistry"], ["⚡", "Energy"],
          ["🧬", "DNA"], ["🔭", "Telescope"], ["⚛️", "Atom"],
          ["🌡️", "Temperature"], ["🧲", "Magnet"]
        ],
        Hard: [
          ["🦠", "Bacteria"], ["🧫", "Cells"], ["🌋", "Volcano"],
          ["🌊", "Waves"], ["🔥", "Combustion"], ["❄️", "Freezing"],
          ["🌪️", "Tornado"], ["⚗️", "Experiment"], ["🧮", "Calculate"], ["📊", "Data"]
        ]
      },
      Technology: {
        Easy: [
          ["💻", "Computer"], ["📱", "Phone"], ["🖱️", "Mouse"],
          ["⌨️", "Keyboard"], ["🖥️", "Monitor"], ["🔌", "Power"]
        ],
        Medium: [
          ["🤖", "Robot"], ["💾", "Save"], ["🔐", "Security"],
          ["📡", "Network"], ["☁️", "Cloud"], ["🔧", "Tool"],
          ["⚙️", "Settings"], ["🔄", "Sync"]
        ],
        Hard: [
          ["🧠", "AI"], ["🔗", "Blockchain"], ["🛡️", "Firewall"],
          ["📱", "IoT"], ["🎮", "Gaming"], ["🚀", "Launch"],
          ["💡", "Innovation"], ["🔍", "Search"], ["📈", "Analytics"], ["🌐", "Internet"]
        ]
      },
      Math: {
        Easy: [
          ["➕", "Add"], ["➖", "Subtract"], ["✖️", "Multiply"],
          ["➗", "Divide"], ["🔢", "Numbers"], ["📐", "Measure"]
        ],
        Medium: [
          ["📊", "Graph"], ["📈", "Growth"], ["🔺", "Triangle"],
          ["🔷", "Geometry"], ["∞", "Infinity"], ["π", "Pi"],
          ["√", "Root"], ["=", "Equals"]
        ],
        Hard: [
          ["∫", "Integral"], ["∂", "Derivative"], ["∑", "Sum"],
          ["∏", "Product"], ["∆", "Delta"], ["θ", "Theta"],
          ["λ", "Lambda"], ["Ω", "Omega"], ["α", "Alpha"], ["β", "Beta"]
        ]
      },
      Environment: {
        Easy: [
          ["🌳", "Tree"], ["🌺", "Flower"], ["🦋", "Butterfly"],
          ["🐝", "Bee"], ["🌈", "Rainbow"], ["☀️", "Sun"]
        ],
        Medium: [
          ["♻️", "Recycle"], ["🌍", "Planet"], ["💚", "Eco"],
          ["🌿", "Nature"], ["🔋", "Battery"], ["💡", "Energy"],
          ["🚲", "Bike"], ["🌾", "Farm"]
        ],
        Hard: [
          ["🏭", "Industry"], ["🌡️", "Climate"], ["⛰️", "Mountain"],
          ["🌊", "Ocean"], ["🌪️", "Storm"], ["🔥", "Wildfire"],
          ["❄️", "Glacier"], ["🌱", "Growth"], ["🌾", "Agriculture"], ["💧", "Conservation"]
        ]
      },
      Agriculture: {
        Easy: [
          ["🌾", "Wheat"], ["🌽", "Corn"], ["🍅", "Tomato"],
          ["🥕", "Carrot"], ["🚜", "Tractor"], ["🐄", "Cow"]
        ],
        Medium: [
          ["🌱", "Seed"], ["💧", "Irrigate"], ["🌞", "Sunlight"],
          ["🧑‍🌾", "Farmer"], ["🌿", "Organic"], ["🌾", "Harvest"],
          ["🐝", "Pollinate"], ["🌡️", "Season"]
        ],
        Hard: [
          ["🌍", "Soil"], ["💧", "Drainage"], ["🌱", "Germinate"],
          ["🔬", "Genetics"], ["📊", "Yield"], ["🌾", "Crop"],
          ["🦠", "Pest"], ["🌱", "Fertilize"], ["🔄", "Rotation"], ["🌿", "Sustain"]
        ]
      },
      General: {
        Easy: [
          ["😊", "Happy"], ["😢", "Sad"], ["❤️", "Love"],
          ["🎵", "Music"], ["📚", "Book"], ["🏠", "Home"]
        ],
        Medium: [
          ["🎯", "Goal"], ["💭", "Think"], ["🤝", "Team"],
          ["💡", "Idea"], ["🏆", "Win"], ["🎨", "Create"],
          ["🔑", "Key"], ["🌟", "Star"]
        ],
        Hard: [
          ["🧠", "Mind"], ["💼", "Business"], ["📈", "Success"],
          ["🔍", "Research"], ["🎓", "Learn"], ["🚀", "Innovate"],
          ["💪", "Strong"], ["🎯", "Focus"], ["⚡", "Fast"], ["🌟", "Excel"]
        ]
      }
    };

    const selectedSet = cardSets[subject] || cardSets.General;
    const difficultySet = selectedSet[difficulty] || selectedSet.Easy;
    
    const selectedCards = difficultySet.slice(0, totalPairs);
    const cardPairs: Card[] = [];
    
    selectedCards.forEach(([emoji, content], index) => {
      cardPairs.push({
        id: index * 2,
        content,
        emoji,
        matched: false,
        flipped: false
      });
      cardPairs.push({
        id: index * 2 + 1,
        content,
        emoji,
        matched: false,
        flipped: false
      });
    });

    // Shuffle cards
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
  };

  const handleCardClick = (id: number) => {
    if (isChecking || flippedCards.length === 2) return;
    if (cards[id].matched || cards[id].flipped) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves(moves + 1);

      const [first, second] = newFlipped;
      if (cards[first].content === cards[second].content) {
        // Match found!
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].matched = true;
          matchedCards[second].matched = true;
          setCards(matchedCards);
          setScore(score + pointsPerMatch);
          setMatchedPairs(matchedPairs + 1);
          setFlippedCards([]);
          setIsChecking(false);
          
          toast.success("Perfect Match! 🎉", { description: `+${pointsPerMatch} points` });

          if (matchedPairs + 1 === totalPairs) {
            setTimeout(() => {
              setGameComplete(true);
              onComplete(score + pointsPerMatch, totalPairs * pointsPerMatch);
            }, 500);
          }
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].flipped = false;
          resetCards[second].flipped = false;
          setCards(resetCards);
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (gameComplete) {
    const accuracy = moves > 0 ? Math.round((totalPairs / moves) * 100) : 0;
    const timeBonus = Math.max(0, 100 - timeElapsed);
    const finalScore = score + timeBonus;
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center space-y-6"
      >
        <Trophy className="h-24 w-24 text-yellow-500" />
        <h2 className="text-4xl font-bold">Memory Master!</h2>
        <div className="space-y-2">
          <p className="text-2xl font-semibold text-primary">
            Score: {finalScore} points
          </p>
          <p className="text-lg text-muted-foreground">
            {accuracy}% Accuracy • {moves} Moves
          </p>
          <p className="text-sm text-muted-foreground">
            ⏱️ Time: {timeElapsed}s • ⚡ Time Bonus: +{timeBonus} pts
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

  const progress = (matchedPairs / totalPairs) * 100;
  const gridCols = totalPairs <= 6 ? "grid-cols-4" : totalPairs <= 8 ? "grid-cols-4" : "grid-cols-5";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Memory Cards</h2>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Timer className="h-4 w-4 mr-1" />
              {timeElapsed}s
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Star className="h-4 w-4 mr-1" />
              {score} pts
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
            <span>Matched: {matchedPairs} of {totalPairs}</span>
            <span>Moves: {moves}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Instructions */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-center text-sm text-gray-700 dark:text-gray-300">
            💡 Click cards to flip them. Match pairs to win! Fewer moves = higher score
          </p>
        </CardContent>
      </Card>

      {/* Memory Grid */}
      <div className={`grid ${gridCols} gap-4`}>
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.03 }}
            className="aspect-square"
          >
            <div
              onClick={() => handleCardClick(index)}
              className={`relative w-full h-full cursor-pointer transition-all duration-300 transform-style-3d ${
                card.flipped || card.matched ? "rotate-y-180" : ""
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Card Back */}
              <div
                className={`absolute inset-0 flex items-center justify-center rounded-lg border-2 transition-all ${
                  card.matched
                    ? "bg-green-500/20 border-green-500"
                    : card.flipped
                    ? "bg-primary/20 border-primary"
                    : "bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/30 hover:border-primary/60 hover:shadow-lg"
                }`}
                style={{
                  backfaceVisibility: "hidden",
                  transform: card.flipped || card.matched ? "rotateY(180deg)" : "rotateY(0deg)"
                }}
              >
                {card.flipped || card.matched ? (
                  <div className="text-center space-y-2">
                    <div className="text-4xl">{card.emoji}</div>
                    <div className="text-xs font-semibold px-2 text-gray-900 dark:text-white">{card.content}</div>
                  </div>
                ) : (
                  <div className="text-4xl">❓</div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MemoryCardsGame;
