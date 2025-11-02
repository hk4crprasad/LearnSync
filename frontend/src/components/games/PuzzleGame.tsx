import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, RotateCcw, Sparkles } from "lucide-react";
import { VisualGameTemplate } from "@/utils/visualGameTypes";

interface PuzzleGameProps {
  game: VisualGameTemplate;
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface PuzzlePiece {
  id: number;
  correctPosition: number;
  currentPosition: number;
  isEmpty: boolean;
}

export const PuzzleGame = ({ game, onComplete, onClose }: PuzzleGameProps) => {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Determine grid size based on difficulty
  const getGridSize = () => {
    if (game.difficulty === "Easy") return 3; // 3x3 = 9 pieces
    if (game.difficulty === "Medium") return 4; // 4x4 = 16 pieces
    return 5; // 5x5 = 25 pieces
  };

  const gridSize = getGridSize();
  const totalPieces = gridSize * gridSize;

  useEffect(() => {
    initializePuzzle();
  }, []);

  const initializePuzzle = () => {
    // Create puzzle pieces with one empty space
    const newPieces: PuzzlePiece[] = [];
    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({
        id: i,
        correctPosition: i,
        currentPosition: i,
        isEmpty: i === totalPieces - 1, // Last piece is empty
      });
    }

    // Shuffle the puzzle (ensure it's solvable)
    shufflePuzzle(newPieces);
    setPieces(newPieces);
    setScore(0);
    setMoves(0);
    setIsComplete(false);
  };

  const shufflePuzzle = (puzzlePieces: PuzzlePiece[]) => {
    // Perform random valid moves to shuffle
    const shuffleMoves = game.difficulty === "Easy" ? 20 : game.difficulty === "Medium" ? 40 : 60;
    
    for (let i = 0; i < shuffleMoves; i++) {
      const emptyPiece = puzzlePieces.find((p) => p.isEmpty);
      if (!emptyPiece) continue;

      const emptyPos = emptyPiece.currentPosition;
      const neighbors = getNeighbors(emptyPos);
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Swap empty with random neighbor
      const neighborPiece = puzzlePieces.find((p) => p.currentPosition === randomNeighbor);
      if (neighborPiece) {
        const temp = emptyPiece.currentPosition;
        emptyPiece.currentPosition = neighborPiece.currentPosition;
        neighborPiece.currentPosition = temp;
      }
    }
  };

  const getNeighbors = (position: number): number[] => {
    const row = Math.floor(position / gridSize);
    const col = position % gridSize;
    const neighbors: number[] = [];

    // Up
    if (row > 0) neighbors.push((row - 1) * gridSize + col);
    // Down
    if (row < gridSize - 1) neighbors.push((row + 1) * gridSize + col);
    // Left
    if (col > 0) neighbors.push(row * gridSize + (col - 1));
    // Right
    if (col < gridSize - 1) neighbors.push(row * gridSize + (col + 1));

    return neighbors;
  };

  const handlePieceClick = (pieceId: number) => {
    const clickedPiece = pieces.find((p) => p.id === pieceId);
    const emptyPiece = pieces.find((p) => p.isEmpty);

    if (!clickedPiece || !emptyPiece || clickedPiece.isEmpty) return;

    // Check if clicked piece is adjacent to empty space
    const neighbors = getNeighbors(emptyPiece.currentPosition);
    if (!neighbors.includes(clickedPiece.currentPosition)) return;

    // Swap pieces
    const newPieces = [...pieces];
    const clickedIndex = newPieces.findIndex((p) => p.id === pieceId);
    const emptyIndex = newPieces.findIndex((p) => p.isEmpty);

    const temp = newPieces[clickedIndex].currentPosition;
    newPieces[clickedIndex].currentPosition = newPieces[emptyIndex].currentPosition;
    newPieces[emptyIndex].currentPosition = temp;

    setPieces(newPieces);
    setMoves(moves + 1);

    // Check if puzzle is solved
    checkCompletion(newPieces);
  };

  const checkCompletion = (currentPieces: PuzzlePiece[]) => {
    const isSolved = currentPieces.every(
      (piece) => piece.correctPosition === piece.currentPosition
    );

    if (isSolved) {
      const finalScore = Math.max(
        game.pointsPerCorrect,
        Math.floor(game.maxPoints - moves * 2)
      );
      setScore(finalScore);
      setIsComplete(true);
      setShowCelebration(true);

      setTimeout(() => {
        onComplete(finalScore);
      }, 2000);
    }
  };

  const getPieceColor = (piece: PuzzlePiece) => {
    if (piece.isEmpty) return "bg-slate-200 dark:bg-slate-700";
    
    // Color based on subject
    if (game.subjects.includes("Math")) {
      const colors = ["bg-blue-400", "bg-cyan-400", "bg-indigo-400", "bg-sky-400"];
      return colors[piece.id % colors.length];
    }
    if (game.subjects.includes("Technology")) {
      const colors = ["bg-purple-400", "bg-violet-400", "bg-indigo-400", "bg-fuchsia-400"];
      return colors[piece.id % colors.length];
    }
    if (game.subjects.includes("Art") || game.subjects.includes("Design")) {
      const colors = ["bg-pink-400", "bg-rose-400", "bg-red-400", "bg-orange-400"];
      return colors[piece.id % colors.length];
    }
    // Default colors
    const colors = ["bg-green-400", "bg-emerald-400", "bg-teal-400", "bg-lime-400"];
    return colors[piece.id % colors.length];
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
              Moves: <span className="font-bold ml-1">{moves}</span>
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
                Click tiles next to the empty space to move them. Arrange in order!
              </p>

              {/* Puzzle Grid */}
              <div
                className="grid gap-2 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  maxWidth: gridSize === 3 ? "300px" : gridSize === 4 ? "400px" : "500px",
                }}
              >
                {pieces
                  .sort((a, b) => a.currentPosition - b.currentPosition)
                  .map((piece) => (
                    <motion.button
                      key={piece.id}
                      layout
                      onClick={() => handlePieceClick(piece.id)}
                      disabled={piece.isEmpty}
                      className={`
                        aspect-square rounded-lg font-bold text-white text-2xl
                        ${getPieceColor(piece)}
                        ${
                          !piece.isEmpty
                            ? "cursor-pointer hover:scale-105 active:scale-95 shadow-lg"
                            : "cursor-default"
                        }
                        transition-all duration-200
                      `}
                      whileHover={!piece.isEmpty ? { scale: 1.05 } : {}}
                      whileTap={!piece.isEmpty ? { scale: 0.95 } : {}}
                    >
                      {!piece.isEmpty && piece.id + 1}
                    </motion.button>
                  ))}
              </div>

              {/* Reset Button */}
              <div className="flex justify-center mt-6">
                <Button
                  onClick={initializePuzzle}
                  variant="outline"
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Puzzle
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
                Puzzle Solved!
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Completed in {moves} moves!
              </p>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                +{score} points
              </div>
            </motion.div>
          )}
        </div>

        {/* Celebration Animation */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: "50%",
                    y: "50%",
                    scale: 0,
                  }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 100}%`,
                    y: `${50 + (Math.random() - 0.5) * 100}%`,
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.05,
                  }}
                  className="absolute"
                >
                  <Sparkles className="text-yellow-400 h-8 w-8" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
