import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Link2, Trophy, Star, Check, X } from "lucide-react";

interface MatchingPairsGameProps {
  difficulty: "Easy" | "Medium" | "Hard";
  subject?: string;
  onComplete: (score: number, maxScore: number) => void;
  onClose: () => void;
}

interface Pair {
  id: string;
  left: string;
  right: string;
}

const MatchingPairsGame = ({ difficulty, subject = "General", onComplete, onClose }: MatchingPairsGameProps) => {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [shuffledRights, setShuffledRights] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const pointsPerMatch = 15;
  const totalPairs = difficulty === "Easy" ? 6 : difficulty === "Medium" ? 8 : 10;

  useEffect(() => {
    generatePairs();
  }, [difficulty, subject]);

  const generatePairs = () => {
    const pairLists: Record<string, { Easy: string[][]; Medium: string[][]; Hard: string[][] }> = {
      Science: {
        Easy: [
          ["Sun", "Star that gives us light"],
          ["Moon", "Earth's natural satellite"],
          ["Water", "H2O liquid"],
          ["Plant", "Makes its own food"],
          ["Animal", "Living creature that moves"],
          ["Rock", "Hard solid material"],
          ["Cloud", "Water vapor in sky"],
          ["Rain", "Water falling from clouds"]
        ],
        Medium: [
          ["Photosynthesis", "Plants making food"],
          ["Gravity", "Force pulling objects down"],
          ["Atom", "Smallest unit of element"],
          ["Cell", "Basic unit of life"],
          ["DNA", "Genetic material"],
          ["Evolution", "Change over time"],
          ["Ecosystem", "Community of organisms"],
          ["Molecule", "Two or more atoms bonded"]
        ],
        Hard: [
          ["Mitochondria", "Powerhouse of cell"],
          ["Chromosome", "DNA structure"],
          ["Photon", "Particle of light"],
          ["Enzyme", "Biological catalyst"],
          ["Neutron", "Neutral atomic particle"],
          ["Metabolism", "Chemical reactions in body"],
          ["Homeostasis", "Body's balance"],
          ["Respiration", "Cellular energy process"],
          ["Osmosis", "Water movement"],
          ["Catalyst", "Speeds up reactions"]
        ]
      },
      Mathematics: {
        Easy: [
          ["2 + 2", "4"],
          ["5 × 3", "15"],
          ["10 ÷ 2", "5"],
          ["Circle", "Round shape"],
          ["Triangle", "3 sides"],
          ["Square", "4 equal sides"],
          ["Half", "1/2"],
          ["Double", "×2"]
        ],
        Medium: [
          ["π (Pi)", "≈ 3.14159"],
          ["Perimeter", "Distance around shape"],
          ["Area", "Space inside shape"],
          ["Diameter", "Line through center"],
          ["Radius", "Half of diameter"],
          ["Angle", "Space between lines"],
          ["Parallel", "Never meet"],
          ["Perpendicular", "Meet at 90°"]
        ],
        Hard: [
          ["Pythagorean", "a² + b² = c²"],
          ["Quadratic", "ax² + bx + c"],
          ["Derivative", "Rate of change"],
          ["Integral", "Area under curve"],
          ["Logarithm", "Inverse of exponential"],
          ["Sine", "Opposite/Hypotenuse"],
          ["Cosine", "Adjacent/Hypotenuse"],
          ["Tangent", "Opposite/Adjacent"],
          ["Prime", "Divisible by 1 and itself"],
          ["Factorial", "n! = n × (n-1) × ..."]
        ]
      },
      English: {
        Easy: [
          ["Cat", "Meow"],
          ["Dog", "Bark"],
          ["Happy", "😊"],
          ["Sad", "😢"],
          ["Big", "Large"],
          ["Small", "Tiny"],
          ["Hot", "Warm"],
          ["Cold", "Cool"]
        ],
        Medium: [
          ["Metaphor", "Comparison without like/as"],
          ["Simile", "Comparison with like/as"],
          ["Noun", "Person, place, or thing"],
          ["Verb", "Action word"],
          ["Adjective", "Describes noun"],
          ["Adverb", "Describes verb"],
          ["Synonym", "Similar meaning"],
          ["Antonym", "Opposite meaning"]
        ],
        Hard: [
          ["Alliteration", "Repeated initial sounds"],
          ["Onomatopoeia", "Sound words"],
          ["Personification", "Human traits to objects"],
          ["Hyperbole", "Extreme exaggeration"],
          ["Irony", "Opposite of expected"],
          ["Foreshadowing", "Hints at future"],
          ["Allegory", "Symbolic narrative"],
          ["Oxymoron", "Contradictory terms"],
          ["Paradox", "Self-contradicting"],
          ["Euphemism", "Mild expression"]
        ]
      },
      General: {
        Easy: [
          ["🐱", "Cat"],
          ["🐶", "Dog"],
          ["🍎", "Apple"],
          ["🌞", "Sun"],
          ["🌙", "Moon"],
          ["⭐", "Star"],
          ["🌊", "Water"],
          ["🌳", "Tree"]
        ],
        Medium: [
          ["January", "First month"],
          ["December", "Last month"],
          ["Monday", "Start of work week"],
          ["Friday", "End of work week"],
          ["Spring", "Flowers bloom"],
          ["Summer", "Hot season"],
          ["Autumn", "Leaves fall"],
          ["Winter", "Cold season"]
        ],
        Hard: [
          ["Renaissance", "14th-17th century revival"],
          ["Democracy", "Rule by people"],
          ["Constitution", "Fundamental law"],
          ["Revolution", "Major change"],
          ["Industrial", "Manufacturing era"],
          ["Digital", "Computer age"],
          ["Globalization", "Worldwide connection"],
          ["Sustainability", "Long-term balance"],
          ["Innovation", "New ideas"],
          ["Tradition", "Passed down customs"]
        ]
      }
    };

    const selectedList = pairLists[subject] || pairLists.General;
    const difficultyPairs = selectedList[difficulty] || selectedList.Easy;
    
    const selectedPairs = [...difficultyPairs]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalPairs)
      .map(([left, right], index) => ({
        id: `pair-${index}`,
        left,
        right
      }));

    setPairs(selectedPairs);
    setShuffledRights([...selectedPairs.map(p => p.right)].sort(() => Math.random() - 0.5));
  };

  const handleLeftClick = (index: number) => {
    if (matched.has(index)) return;
    setSelectedLeft(index);
  };

  const handleRightClick = (index: number) => {
    if (matched.has(index)) return;
    setSelectedRight(index);

    if (selectedLeft !== null) {
      const leftPair = pairs[selectedLeft];
      const rightValue = shuffledRights[index];

      setAttempts(attempts + 1);

      if (leftPair.right === rightValue) {
        // Correct match
        setMatched(new Set([...matched, selectedLeft]));
        setScore(score + pointsPerMatch);
        toast.success("Perfect Match! 🎉", { description: `+${pointsPerMatch} points` });

        if (matched.size + 1 === pairs.length) {
          setTimeout(() => {
            setGameComplete(true);
            onComplete(score + pointsPerMatch, pairs.length * pointsPerMatch);
          }, 1000);
        }
      } else {
        // Wrong match
        toast.error("Not a match! Try again");
      }

      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 800);
    }
  };

  if (pairs.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (gameComplete) {
    const percentage = Math.round((score / (pairs.length * pointsPerMatch)) * 100);
    const accuracy = attempts > 0 ? Math.round((pairs.length / attempts) * 100) : 0;
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center space-y-6"
      >
        <Trophy className="h-24 w-24 text-yellow-500" />
        <h2 className="text-4xl font-bold">All Matched!</h2>
        <div className="space-y-2">
          <p className="text-2xl font-semibold text-primary">
            Score: {score} / {pairs.length * pointsPerMatch}
          </p>
          <p className="text-lg text-muted-foreground">
            {percentage}% Score • {accuracy}% Accuracy
          </p>
          <p className="text-sm text-muted-foreground">
            {attempts} attempts
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

  const progress = (matched.size / pairs.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link2 className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Matching Pairs</h2>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Star className="h-4 w-4 mr-1" />
            {score} pts
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Matched: {matched.size} of {pairs.length}</span>
            <span>Attempts: {attempts}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Instructions */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            💡 Select an item from the left, then match it with the correct item on the right
          </p>
        </CardContent>
      </Card>

      {/* Game Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-3">
          {pairs.map((pair, index) => (
            <motion.div
              key={`left-${index}`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                onClick={() => handleLeftClick(index)}
                variant={selectedLeft === index ? "default" : "outline"}
                className={`w-full h-auto py-4 px-4 text-left justify-start ${
                  matched.has(index) ? "opacity-40 cursor-not-allowed bg-green-500/20 border-green-500" : ""
                }`}
                disabled={matched.has(index)}
              >
                <div className="flex items-center gap-3 w-full">
                  {matched.has(index) && <Check className="h-5 w-5 text-green-600 flex-shrink-0" />}
                  <span className="text-sm font-medium">{pair.left}</span>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {shuffledRights.map((right, index) => {
            const isMatched = pairs.some((pair, i) => matched.has(i) && pair.right === right);
            const isSelected = selectedRight === index;

            return (
              <motion.div
                key={`right-${index}`}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  onClick={() => handleRightClick(index)}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full h-auto py-4 px-4 text-left justify-start ${
                    isMatched ? "opacity-40 cursor-not-allowed bg-green-500/20 border-green-500" : ""
                  }`}
                  disabled={isMatched || selectedLeft === null}
                >
                  <div className="flex items-center gap-3 w-full">
                    {isMatched && <Check className="h-5 w-5 text-green-600 flex-shrink-0" />}
                    <span className="text-sm font-medium">{right}</span>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchingPairsGame;
