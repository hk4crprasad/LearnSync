import { UserProfile } from "@/contexts/UserProfileContext";

export type VisualGameType = 
  | "word-scramble"
  | "matching-pairs"
  | "drag-drop"
  | "fill-blanks"
  | "memory-cards"
  | "puzzle"
  | "sorting"
  | "pattern-recognition"
  | "quiz";

export interface VisualGameTemplate {
  id: string;
  title: string;
  emoji: string;
  description: string;
  gameType: VisualGameType;
  difficulty: "Easy" | "Medium" | "Hard";
  ageGroup: string[];
  subjects: string[];
  pointsPerCorrect: number;
  maxPoints: number;
  color: string;
  instructions: string;
}

/**
 * Generate visual educational games based on student's grade/age level
 */
export const generateVisualGames = (profile: UserProfile): VisualGameTemplate[] => {
  const { ageGroup, interests, learningGoals } = profile;
  const games: VisualGameTemplate[] = [];

  // Determine difficulty based on age
  const age = getAgeFromGroup(ageGroup);
  const difficulty = age <= 11 ? "Easy" : age <= 14 ? "Medium" : "Hard";

  // Interest mapping to subjects
  const interestToSubject: Record<string, string> = {
    "Environment": "Environment",
    "Agriculture": "Agriculture",
    "Technology": "Technology",
    "Math": "Math",
    "Art": "Art",
    "Storytelling": "English",
    "Economy": "Economy",
    "Teamwork": "Teamwork",
    "Design": "Design",
    "Science": "Science"
  };

  // Get primary subject from interests
  const primarySubjects = interests?.map(interest => interestToSubject[interest] || "General") || ["General"];
  const mainSubject = primarySubjects[0] || "General";

  // === PATTERN RECOGNITION (Simon Says style) ===
  games.push({
    id: "pattern-recognition",
    title: "Pattern Master 🎯",
    emoji: "🎯",
    description: "Watch the pattern and repeat it! Test your memory like Simon Says!",
    gameType: "pattern-recognition",
    difficulty,
    ageGroup: [ageGroup],
    subjects: primarySubjects,
    pointsPerCorrect: 25,
    maxPoints: difficulty === "Easy" ? 200 : difficulty === "Medium" ? 300 : 375,
    color: "from-yellow-400 to-orange-500",
    instructions: "Watch the lights flash, then repeat the pattern by clicking the buttons in order!"
  });

  // === MEMORY CARDS ===
  games.push({
    id: "memory-cards",
    title: `${mainSubject} Memory Match 🃏`,
    emoji: "🃏",
    description: `Flip cards and match ${mainSubject.toLowerCase()} pairs! Train your memory!`,
    gameType: "memory-cards",
    difficulty,
    ageGroup: [ageGroup],
    subjects: primarySubjects,
    pointsPerCorrect: 20,
    maxPoints: difficulty === "Easy" ? 120 : difficulty === "Medium" ? 160 : 200,
    color: "from-purple-400 to-pink-500",
    instructions: "Click two cards to flip them. Match all pairs to win!"
  });

  // === WORD SCRAMBLE ===
  games.push({
    id: "word-scramble",
    title: `${mainSubject} Word Scramble 🔤`,
    emoji: "🔤",
    description: `Unscramble ${mainSubject.toLowerCase()} terms and boost your vocabulary!`,
    gameType: "word-scramble",
    difficulty,
    ageGroup: [ageGroup],
    subjects: primarySubjects,
    pointsPerCorrect: 10,
    maxPoints: difficulty === "Easy" ? 100 : difficulty === "Medium" ? 80 : 60,
    color: "from-green-400 to-emerald-500",
    instructions: "Rearrange the jumbled letters to form the correct word!"
  });

  // === MATCHING PAIRS ===
  games.push({
    id: "matching-pairs",
    title: `${mainSubject} Matching 🎴`,
    emoji: "🎴",
    description: `Match ${mainSubject.toLowerCase()} concepts with their definitions!`,
    gameType: "matching-pairs",
    difficulty,
    ageGroup: [ageGroup],
    subjects: primarySubjects,
    pointsPerCorrect: 15,
    maxPoints: difficulty === "Easy" ? 90 : difficulty === "Medium" ? 120 : 150,
    color: "from-blue-400 to-cyan-500",
    instructions: "Select an item from the left, then match it with the correct item on the right!"
  });

  // === QUIZ CHALLENGE ===
  games.push({
    id: "quiz-challenge",
    title: `${mainSubject} Quiz 📝`,
    emoji: "📝",
    description: `Test your ${mainSubject.toLowerCase()} knowledge with multiple choice questions!`,
    gameType: "quiz",
    difficulty,
    ageGroup: [ageGroup],
    subjects: primarySubjects,
    pointsPerCorrect: 10,
    maxPoints: difficulty === "Easy" ? 100 : difficulty === "Medium" ? 80 : 60,
    color: "from-orange-400 to-red-500",
    instructions: "Choose the correct answer for each question. Learn from explanations!"
  });

  // === ADDITIONAL GAMES FOR SPECIFIC INTERESTS ===

  // Environment-specific games
  if (interests?.includes("Environment")) {
    games.push({
      id: "environment-sorting",
      title: "Eco Sorting Game ♻️",
      emoji: "♻️",
      description: "Sort items into recyclable, compostable, or trash categories!",
      gameType: "sorting",
      difficulty,
      ageGroup: [ageGroup],
      subjects: ["Environment"],
      pointsPerCorrect: 15,
      maxPoints: 150,
      color: "from-green-500 to-teal-500",
      instructions: "Drag items to the correct bin to help save the environment!"
    });
  }

  // Agriculture-specific games
  if (interests?.includes("Agriculture")) {
    games.push({
      id: "agriculture-timeline",
      title: "Farming Seasons 🌾",
      emoji: "🌾",
      description: "Arrange farming activities in the correct seasonal order!",
      gameType: "drag-drop",
      difficulty,
      ageGroup: [ageGroup],
      subjects: ["Agriculture"],
      pointsPerCorrect: 15,
      maxPoints: 150,
      color: "from-amber-400 to-yellow-500",
      instructions: "Drag farming activities to arrange them in the correct order!"
    });
  }

  // Technology-specific games
  if (interests?.includes("Technology")) {
    games.push({
      id: "tech-coding",
      title: "Code Sequence 💻",
      emoji: "💻",
      description: "Arrange code blocks in the correct order to solve problems!",
      gameType: "drag-drop",
      difficulty,
      ageGroup: [ageGroup],
      subjects: ["Technology"],
      pointsPerCorrect: 20,
      maxPoints: 160,
      color: "from-indigo-400 to-purple-500",
      instructions: "Drag code blocks to create the correct sequence!"
    });
  }

  // Math-specific games
  if (interests?.includes("Math")) {
    games.push({
      id: "math-puzzle",
      title: "Number Puzzle 🔢",
      emoji: "🔢",
      description: "Solve mathematical puzzles and patterns!",
      gameType: "puzzle",
      difficulty,
      ageGroup: [ageGroup],
      subjects: ["Math"],
      pointsPerCorrect: 25,
      maxPoints: 150,
      color: "from-cyan-400 to-blue-500",
      instructions: "Complete the puzzle by solving math problems!"
    });
  }

  // Art & Design-specific games
  if (interests?.includes("Art") || interests?.includes("Design")) {
    games.push({
      id: "art-pattern",
      title: "Art Pattern Match 🎨",
      emoji: "🎨",
      description: "Identify and complete artistic patterns!",
      gameType: "pattern-recognition",
      difficulty,
      ageGroup: [ageGroup],
      subjects: ["Art", "Design"],
      pointsPerCorrect: 20,
      maxPoints: 160,
      color: "from-pink-400 to-rose-500",
      instructions: "Watch the color pattern and recreate it!"
    });
  }

  // Storytelling-specific games
  if (interests?.includes("Storytelling")) {
    games.push({
      id: "story-sequence",
      title: "Story Builder 📚",
      emoji: "📚",
      description: "Arrange story events in the correct sequence!",
      gameType: "drag-drop",
      difficulty,
      ageGroup: [ageGroup],
      subjects: ["English", "Storytelling"],
      pointsPerCorrect: 15,
      maxPoints: 150,
      color: "from-violet-400 to-purple-500",
      instructions: "Drag story parts to create the correct narrative sequence!"
    });
  }

  // Teamwork-specific games
  if (interests?.includes("Teamwork") || learningGoals?.includes("Improve teamwork skills")) {
    games.push({
      id: "teamwork-scenarios",
      title: "Team Builder 🤝",
      emoji: "🤝",
      description: "Learn teamwork through interactive scenarios!",
      gameType: "quiz",
      difficulty,
      ageGroup: [ageGroup],
      subjects: ["Teamwork"],
      pointsPerCorrect: 10,
      maxPoints: 100,
      color: "from-teal-400 to-cyan-500",
      instructions: "Choose the best teamwork approach for each situation!"
    });
  }

  // Economy-specific games  
  if (interests?.includes("Economy")) {
    games.push({
      id: "economy-budget",
      title: "Budget Master 💰",
      emoji: "💰",
      description: "Learn to manage money and make economic decisions!",
      gameType: "quiz",
      difficulty,
      ageGroup: [ageGroup],
      subjects: ["Economy"],
      pointsPerCorrect: 15,
      maxPoints: 150,
      color: "from-yellow-500 to-amber-600",
      instructions: "Make the best financial choices and learn about economics!"
    });
  }

  // Filter games if user has specific interests (show relevant ones first)
  if (interests && interests.length > 0) {
    const relevantGames = games.filter(game => 
      game.subjects.some(subject => 
        primarySubjects.includes(subject) || subject === "General"
      )
    );
    
    // Return relevant games first, then others, limited to 8-12 games
    const allGames = [...relevantGames, ...games.filter(g => !relevantGames.includes(g))];
    return allGames.slice(0, 12);
  }

  return games.slice(0, 10);
};

/**
 * Helper function to get numeric age from age group string
 */
const getAgeFromGroup = (ageGroup: string): number => {
  const ageMap: Record<string, number> = {
    "6–8 years": 7,
    "9–11 years": 10,
    "12–14 years": 13,
    "15–17 years": 16,
    "18+ years": 20
  };
  return ageMap[ageGroup] || 10;
};

/**
 * Get game content based on game type and difficulty
 */
export const getGameContent = (gameId: string, difficulty: string) => {
  // This will be implemented in individual game components
  // Each game type will have its own content generator
  return {
    gameId,
    difficulty,
    content: []
  };
}
