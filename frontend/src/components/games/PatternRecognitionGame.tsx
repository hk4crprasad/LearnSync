import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Zap, Trophy, Star, Play, RotateCcw } from "lucide-react";

interface PatternGameProps {
  difficulty: "Easy" | "Medium" | "Hard";
  subject?: string;
  onComplete: (score: number, maxScore: number) => void;
  onClose: () => void;
}

const PatternRecognitionGame = ({ difficulty, subject = "General", onComplete, onClose }: PatternGameProps) => {
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  const maxLevel = difficulty === "Easy" ? 8 : difficulty === "Medium" ? 12 : 15;
  const numButtons = difficulty === "Easy" ? 4 : difficulty === "Medium" ? 6 : 9;
  const pointsPerLevel = 25;

  // Button colors and sounds based on subject
  const buttonConfig: Record<string, { colors: string[]; sounds: number[] }> = {
    Science: {
      colors: ["bg-blue-500", "bg-green-500", "bg-red-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-teal-500", "bg-indigo-500"],
      sounds: [262, 294, 330, 349, 392, 440, 494, 523, 587] // C, D, E, F, G, A, B, C, D
    },
    Technology: {
      colors: ["bg-cyan-500", "bg-gray-500", "bg-slate-500", "bg-zinc-500", "bg-blue-600", "bg-indigo-600", "bg-purple-600", "bg-pink-600", "bg-rose-600"],
      sounds: [220, 247, 277, 294, 330, 370, 415, 440, 494]
    },
    Math: {
      colors: ["bg-emerald-500", "bg-lime-500", "bg-amber-500", "bg-orange-500", "bg-red-500", "bg-rose-500", "bg-fuchsia-500", "bg-violet-500", "bg-indigo-500"],
      sounds: [196, 220, 247, 262, 294, 330, 349, 392, 440]
    },
    General: {
      colors: ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-teal-500", "bg-cyan-500"],
      sounds: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33]
    }
  };

  const config = buttonConfig[subject] || buttonConfig.General;
  const colors = config.colors.slice(0, numButtons);
  const sounds = config.sounds.slice(0, numButtons);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  const playSound = (frequency: number, duration: number = 300) => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration / 1000);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration / 1000);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setPattern([]);
    setUserPattern([]);
    nextRound([]);
  };

  const nextRound = (currentPattern: number[]) => {
    const newPattern = [...currentPattern, Math.floor(Math.random() * numButtons)];
    setPattern(newPattern);
    setUserPattern([]);
    playPattern(newPattern);
  };

  const playPattern = async (patternToPlay: number[]) => {
    setIsPlaying(true);
    setIsUserTurn(false);

    for (let i = 0; i < patternToPlay.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveButton(patternToPlay[i]);
      playSound(sounds[patternToPlay[i]]);
      await new Promise(resolve => setTimeout(resolve, 400));
      setActiveButton(null);
    }

    setIsPlaying(false);
    setIsUserTurn(true);
  };

  const handleButtonClick = (index: number) => {
    if (!isUserTurn || isPlaying) return;

    setActiveButton(index);
    playSound(sounds[index]);
    setTimeout(() => setActiveButton(null), 300);

    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);

    // Check if the user's input matches the pattern so far
    if (newUserPattern[newUserPattern.length - 1] !== pattern[newUserPattern.length - 1]) {
      // Wrong!
      setGameOver(true);
      setIsUserTurn(false);
      toast.error("Wrong Pattern! 😔", {
        description: `You reached level ${level}`
      });
      onComplete(score, maxLevel * pointsPerLevel);
      return;
    }

    // Check if the user completed the pattern
    if (newUserPattern.length === pattern.length) {
      // Correct! Level up
      const newScore = score + pointsPerLevel;
      setScore(newScore);
      setLevel(level + 1);
      setIsUserTurn(false);

      toast.success(`Level ${level} Complete! 🎉`, {
        description: `+${pointsPerLevel} points`
      });

      if (level >= maxLevel) {
        // Game won!
        setTimeout(() => {
          setGameOver(true);
          onComplete(newScore, maxLevel * pointsPerLevel);
        }, 1000);
      } else {
        setTimeout(() => {
          nextRound(pattern);
        }, 1500);
      }
    }
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
        <Zap className="h-24 w-24 text-yellow-500" />
        <div>
          <h2 className="text-4xl font-bold mb-3">Pattern Master</h2>
          <p className="text-lg text-muted-foreground mb-2">
            Watch the pattern and repeat it!
          </p>
          <p className="text-sm text-muted-foreground">
            Similar to Simon Says - memorize and repeat the sequence
          </p>
        </div>
        
        <Card className="bg-primary/5 border-primary/20 max-w-md">
          <CardContent className="pt-6 space-y-3 text-left">
            <div className="flex items-start gap-2">
              <span className="text-2xl">👀</span>
              <div>
                <p className="font-semibold">Watch</p>
                <p className="text-sm text-muted-foreground">Observe the flashing pattern</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-2xl">🧠</span>
              <div>
                <p className="font-semibold">Remember</p>
                <p className="text-sm text-muted-foreground">Memorize the sequence</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-2xl">👆</span>
              <div>
                <p className="font-semibold">Repeat</p>
                <p className="text-sm text-muted-foreground">Click the buttons in order</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {numButtons} Buttons • Level 1-{maxLevel} • {pointsPerLevel} pts/level
          </Badge>
        </div>

        <Button onClick={startGame} size="lg" className="gap-2">
          <Play className="h-5 w-5" />
          Start Game
        </Button>
      </div>
    );
  }

  if (gameOver) {
    const percentage = Math.round((score / (maxLevel * pointsPerLevel)) * 100);
    const isWinner = level > maxLevel;

    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center space-y-6"
      >
        <Trophy className="h-24 w-24 text-yellow-500" />
        <h2 className="text-4xl font-bold">
          {isWinner ? "Perfect Memory! 🎉" : "Good Try!"}
        </h2>
        <div className="space-y-2">
          <p className="text-2xl font-semibold text-primary">
            Score: {score} / {maxLevel * pointsPerLevel}
          </p>
          <p className="text-lg text-muted-foreground">
            Level {level} Reached • {percentage}% Complete
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={startGame} size="lg" className="gap-2">
            <RotateCcw className="h-5 w-5" />
            Play Again
          </Button>
          <Button onClick={onClose} variant="outline" size="lg">
            Back to Dashboard
          </Button>
        </div>
      </motion.div>
    );
  }

  const progress = ((level - 1) / maxLevel) * 100;
  const gridCols = numButtons === 4 ? "grid-cols-2" : numButtons === 6 ? "grid-cols-3" : "grid-cols-3";

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Pattern Master</h2>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Star className="h-4 w-4 mr-1" />
            {score} pts
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Level {level} of {maxLevel}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Status */}
      <Card className={`${isPlaying ? "bg-yellow-500/10 border-yellow-500" : isUserTurn ? "bg-green-500/10 border-green-500" : "bg-blue-500/10 border-blue-500"} transition-all`}>
        <CardContent className="pt-6">
          <p className="text-center text-lg font-semibold">
            {isPlaying ? "👀 Watch the pattern..." : isUserTurn ? "👆 Your turn! Repeat the pattern" : "🎮 Get ready..."}
          </p>
          {isUserTurn && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              {userPattern.length} of {pattern.length} buttons clicked
            </p>
          )}
        </CardContent>
      </Card>

      {/* Game Buttons */}
      <div className={`grid ${gridCols} gap-4 max-w-lg mx-auto`}>
        {colors.map((color, index) => (
          <motion.button
            key={index}
            onClick={() => handleButtonClick(index)}
            disabled={!isUserTurn || isPlaying}
            className={`aspect-square rounded-xl ${color} transition-all duration-200 transform
              ${activeButton === index ? "scale-110 brightness-150 shadow-2xl" : "brightness-75"}
              ${isUserTurn && !isPlaying ? "hover:scale-105 hover:brightness-100 cursor-pointer" : "cursor-not-allowed"}
              disabled:opacity-50 relative overflow-hidden`}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-white drop-shadow-lg">
                {index + 1}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Instructions */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            💡 Each level adds one more button to remember. Listen to the sounds and watch the lights!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatternRecognitionGame;
