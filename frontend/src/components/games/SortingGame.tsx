import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, RotateCcw, Trash2, Leaf, Recycle } from "lucide-react";
import { VisualGameTemplate } from "@/utils/visualGameTypes";

interface SortingGameProps {
  game: VisualGameTemplate;
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface SortingItem {
  id: number;
  name: string;
  category: string;
  emoji: string;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
}

export const SortingGame = ({ game, onComplete, onClose }: SortingGameProps) => {
  const [items, setItems] = useState<SortingItem[]>([]);
  const [categories] = useState<Category[]>([
    { id: "recyclable", name: "Recyclable", icon: Recycle, color: "bg-blue-500" },
    { id: "compostable", name: "Compostable", icon: Leaf, color: "bg-green-500" },
    { id: "trash", name: "Trash", icon: Trash2, color: "bg-gray-500" },
  ]);
  const [sortedItems, setSortedItems] = useState<Record<string, SortingItem[]>>({
    recyclable: [],
    compostable: [],
    trash: [],
  });
  const [score, setScore] = useState(0);
  const [itemsCorrect, setItemsCorrect] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const allItems: SortingItem[] = [
    // Recyclable
    { id: 1, name: "Plastic Bottle", category: "recyclable", emoji: "🍾" },
    { id: 2, name: "Paper", category: "recyclable", emoji: "📄" },
    { id: 3, name: "Glass Jar", category: "recyclable", emoji: "🫙" },
    { id: 4, name: "Aluminum Can", category: "recyclable", emoji: "🥫" },
    { id: 5, name: "Cardboard Box", category: "recyclable", emoji: "📦" },
    { id: 6, name: "Metal Can", category: "recyclable", emoji: "🥫" },
    { id: 7, name: "Newspaper", category: "recyclable", emoji: "📰" },
    
    // Compostable
    { id: 8, name: "Apple Core", category: "compostable", emoji: "🍎" },
    { id: 9, name: "Banana Peel", category: "compostable", emoji: "🍌" },
    { id: 10, name: "Coffee Grounds", category: "compostable", emoji: "☕" },
    { id: 11, name: "Leaves", category: "compostable", emoji: "🍂" },
    { id: 12, name: "Vegetable Scraps", category: "compostable", emoji: "🥬" },
    { id: 13, name: "Eggshells", category: "compostable", emoji: "🥚" },
    
    // Trash
    { id: 14, name: "Plastic Bag", category: "trash", emoji: "🛍️" },
    { id: 15, name: "Styrofoam", category: "trash", emoji: "📦" },
    { id: 16, name: "Chip Bag", category: "trash", emoji: "🍿" },
    { id: 17, name: "Straw", category: "trash", emoji: "🥤" },
    { id: 18, name: "Broken Glass", category: "trash", emoji: "🔨" },
    { id: 19, name: "Dirty Napkin", category: "trash", emoji: "🧻" },
  ];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Select items based on difficulty
    const itemCount = game.difficulty === "Easy" ? 6 : game.difficulty === "Medium" ? 9 : 12;
    const selectedItems = [...allItems]
      .sort(() => Math.random() - 0.5)
      .slice(0, itemCount);
    
    setItems(selectedItems);
    setSortedItems({ recyclable: [], compostable: [], trash: [] });
    setScore(0);
    setItemsCorrect(0);
    setIsComplete(false);
    setFeedback(null);
  };

  const handleItemDrop = (item: SortingItem, categoryId: string) => {
    // Remove item from unsorted list
    setItems(items.filter((i) => i.id !== item.id));

    // Add to category
    const newSortedItems = { ...sortedItems };
    newSortedItems[categoryId] = [...newSortedItems[categoryId], item];
    setSortedItems(newSortedItems);

    // Check if correct
    const isCorrect = item.category === categoryId;
    if (isCorrect) {
      const newScore = score + game.pointsPerCorrect;
      const newCorrect = itemsCorrect + 1;
      setScore(newScore);
      setItemsCorrect(newCorrect);
      setFeedback(`✅ Correct! ${item.name} is ${categoryId}!`);
    } else {
      setFeedback(`❌ Oops! ${item.name} should go in ${item.category}.`);
    }

    // Clear feedback after 2 seconds
    setTimeout(() => setFeedback(null), 2000);

    // Check if game is complete
    if (items.length === 1) {
      setTimeout(() => {
        setIsComplete(true);
        setTimeout(() => {
          onComplete(score);
        }, 2000);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
              Sorted: <span className="font-bold ml-1">{items.length === 0 ? "All" : `${Object.values(sortedItems).flat().length}/${Object.values(sortedItems).flat().length + items.length}`}</span>
            </Badge>
            <Badge className="bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 border-2 px-4 py-2">
              Correct: <span className="font-bold ml-1">{itemsCorrect}</span>
            </Badge>
            <Badge className="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-2 px-4 py-2">
              Score: <span className="font-bold ml-1">{score}</span>
            </Badge>
          </div>
        </div>

        {/* Game Content */}
        <div className="p-6">
          {!isComplete ? (
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

              {/* Unsorted Items */}
              <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4">
                <h3 className="text-slate-800 dark:text-slate-100 font-bold mb-3">
                  Items to Sort:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="bg-white dark:bg-slate-600 rounded-lg p-3 shadow-md"
                    >
                      <div className="text-3xl mb-1">{item.emoji}</div>
                      <div className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                        {item.name}
                      </div>
                      <div className="flex gap-1 mt-2">
                        {categories.map((cat) => (
                          <Button
                            key={cat.id}
                            size="sm"
                            onClick={() => handleItemDrop(item, cat.id)}
                            className={`${cat.color} hover:opacity-80 text-white text-xs px-2 py-1 h-auto`}
                          >
                            <cat.icon className="h-3 w-3" />
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`${category.color} rounded-xl p-4 min-h-[200px]`}
                  >
                    <div className="flex items-center gap-2 mb-3 text-white">
                      <category.icon className="h-5 w-5" />
                      <h4 className="font-bold">{category.name}</h4>
                    </div>
                    <div className="space-y-2">
                      {sortedItems[category.id]?.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-white/90 dark:bg-slate-800/90 rounded-lg p-2 flex items-center gap-2"
                        >
                          <span className="text-2xl">{item.emoji}</span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {item.name}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reset Button */}
              <div className="flex justify-center mt-4">
                <Button onClick={initializeGame} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  New Game
                </Button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                Great Sorting!
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                You correctly sorted {itemsCorrect} items!
              </p>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                +{score} points
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
