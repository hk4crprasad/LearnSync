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
 * Generate PERSONALIZED visual educational games based on student's unique profile
 * Each student gets different games based on their interests, goals, and age
 */
export const generateVisualGames = (profile: UserProfile): VisualGameTemplate[] => {
  const { ageGroup, interests, learningGoals } = profile;
  const games: VisualGameTemplate[] = [];

  // Determine difficulty based on age - more granular for younger children
  const age = getAgeFromGroup(ageGroup);
  let difficulty: "Easy" | "Medium" | "Hard";
  
  if (age <= 9) {
    difficulty = "Easy";
  } else if (age <= 11) {
    difficulty = "Easy";
  } else if (age <= 14) {
    difficulty = "Medium";
  } else {
    difficulty = "Hard";
  }

  // Interest mapping to subjects with game type preferences
  const interestToGames: Record<string, { subjects: string[]; preferredGames: VisualGameType[] }> = {
    "Environment": {
      subjects: ["Environment", "Science"],
      preferredGames: ["matching-pairs", "quiz", "sorting", "memory-cards"]
    },
    "Agriculture": {
      subjects: ["Agriculture", "Science"],
      preferredGames: ["matching-pairs", "memory-cards", "quiz", "word-scramble"]
    },
    "Technology": {
      subjects: ["Technology", "Science"],
      preferredGames: ["pattern-recognition", "quiz", "puzzle", "word-scramble"]
    },
    "Math": {
      subjects: ["Math"],
      preferredGames: ["pattern-recognition", "puzzle", "quiz", "word-scramble"]
    },
    "Art": {
      subjects: ["Art", "Design"],
      preferredGames: ["memory-cards", "matching-pairs", "puzzle", "pattern-recognition"]
    },
    "Storytelling": {
      subjects: ["English", "Language"],
      preferredGames: ["word-scramble", "fill-blanks", "quiz", "matching-pairs"]
    },
    "Economy": {
      subjects: ["Economy", "Math"],
      preferredGames: ["quiz", "matching-pairs", "word-scramble", "puzzle"]
    },
    "Teamwork": {
      subjects: ["Teamwork", "Social"],
      preferredGames: ["matching-pairs", "quiz", "memory-cards", "pattern-recognition"]
    },
    "Design": {
      subjects: ["Design", "Art"],
      preferredGames: ["pattern-recognition", "memory-cards", "puzzle", "matching-pairs"]
    },
    "Science": {
      subjects: ["Science"],
      preferredGames: ["quiz", "matching-pairs", "memory-cards", "word-scramble"]
    }
  };

  // PERSONALIZATION: Generate games based on student's specific interests
  const selectedInterests = interests || ["Science"]; // Default to Science if no interests
  
  selectedInterests.forEach((interest, index) => {
    const gameConfig = interestToGames[interest] || interestToGames["Science"];
    const subjects = gameConfig.subjects;
    const preferredGames = gameConfig.preferredGames;
    
    // For each interest, create 2-3 personalized games
    preferredGames.slice(0, age <= 9 ? 2 : 3).forEach((gameType, gameIndex) => {
      const subject = subjects[0];
      
      // Create game based on type
      if (gameType === "pattern-recognition" && index === 0) {
        games.push({
          id: `pattern-${interest.toLowerCase()}`,
          title: `${subject} Pattern Master 🎯`,
          emoji: "🎯",
          description: `Learn ${subject.toLowerCase()} through pattern recognition!`,
          gameType: "pattern-recognition",
          difficulty,
          ageGroup: [ageGroup],
          subjects: subjects,
          pointsPerCorrect: 25,
          maxPoints: difficulty === "Easy" ? 150 : difficulty === "Medium" ? 300 : 375,
          color: "from-yellow-400 to-orange-500",
          instructions: `Watch patterns related to ${subject} and repeat them!`
        });
      }
      
      if (gameType === "memory-cards") {
        games.push({
          id: `memory-${interest.toLowerCase()}-${gameIndex}`,
          title: `${subject} Memory Match 🃏`,
          emoji: "🃏",
          description: `Match ${subject.toLowerCase()} concepts and improve memory!`,
          gameType: "memory-cards",
          difficulty,
          ageGroup: [ageGroup],
          subjects: subjects,
          pointsPerCorrect: 20,
          maxPoints: difficulty === "Easy" ? 100 : difficulty === "Medium" ? 160 : 200,
          color: "from-purple-400 to-pink-500",
          instructions: `Flip cards to find matching ${subject.toLowerCase()} pairs!`
        });
      }
      
      if (gameType === "word-scramble") {
        games.push({
          id: `scramble-${interest.toLowerCase()}-${gameIndex}`,
          title: `${subject} Word Challenge 🔤`,
          emoji: "🔤",
          description: `Master ${subject.toLowerCase()} vocabulary through word puzzles!`,
          gameType: "word-scramble",
          difficulty,
          ageGroup: [ageGroup],
          subjects: subjects,
          pointsPerCorrect: 10,
          maxPoints: difficulty === "Easy" ? 80 : difficulty === "Medium" ? 80 : 60,
          color: "from-green-400 to-emerald-500",
          instructions: `Unscramble ${subject.toLowerCase()} terms!`
        });
      }
      
      if (gameType === "matching-pairs") {
        games.push({
          id: `match-${interest.toLowerCase()}-${gameIndex}`,
          title: `${subject} Concept Matching 🎴`,
          emoji: "🎴",
          description: `Connect ${subject.toLowerCase()} ideas with their meanings!`,
          gameType: "matching-pairs",
          difficulty,
          ageGroup: [ageGroup],
          subjects: subjects,
          pointsPerCorrect: 15,
          maxPoints: difficulty === "Easy" ? 75 : difficulty === "Medium" ? 120 : 150,
          color: "from-blue-400 to-cyan-500",
          instructions: `Match ${subject.toLowerCase()} concepts together!`
        });
      }
      
      if (gameType === "quiz") {
        games.push({
          id: `quiz-${interest.toLowerCase()}-${gameIndex}`,
          title: `${subject} Knowledge Test 📝`,
          emoji: "📝",
          description: `Test what you know about ${subject.toLowerCase()}!`,
          gameType: "quiz",
          difficulty,
          ageGroup: [ageGroup],
          subjects: subjects,
          pointsPerCorrect: 10,
          maxPoints: difficulty === "Easy" ? 60 : difficulty === "Medium" ? 80 : 60,
          color: "from-orange-400 to-red-500",
          instructions: `Answer ${subject.toLowerCase()} questions!`
        });
      }
    });
  });

  // LEARNING GOALS BASED GAMES: Add specific games based on learning goals
  if (learningGoals) {
    learningGoals.forEach(goal => {
      if (goal.toLowerCase().includes("memory") || goal.toLowerCase().includes("retention")) {
        // Add extra memory-focused games
        games.push({
          id: "goal-memory-boost",
          title: "Memory Booster Challenge 🧠",
          emoji: "🧠",
          description: "Special game to improve memory and retention!",
          gameType: "memory-cards",
          difficulty,
          ageGroup: [ageGroup],
          subjects: ["General"],
          pointsPerCorrect: 20,
          maxPoints: difficulty === "Easy" ? 100 : difficulty === "Medium" ? 160 : 200,
          color: "from-indigo-400 to-purple-500",
          instructions: "Focus on remembering patterns to boost your memory!"
        });
      }
      
      if (goal.toLowerCase().includes("vocabulary") || goal.toLowerCase().includes("language")) {
        // Add vocabulary-focused games
        games.push({
          id: "goal-vocabulary-builder",
          title: "Vocabulary Builder �",
          emoji: "�",
          description: "Expand your vocabulary with word games!",
          gameType: "word-scramble",
          difficulty,
          ageGroup: [ageGroup],
          subjects: ["English"],
          pointsPerCorrect: 10,
          maxPoints: difficulty === "Easy" ? 80 : difficulty === "Medium" ? 80 : 60,
          color: "from-teal-400 to-green-500",
          instructions: "Learn new words and their meanings!"
        });
      }
      
      if (goal.toLowerCase().includes("problem") || goal.toLowerCase().includes("logic")) {
        // Add problem-solving games
        games.push({
          id: "goal-problem-solver",
          title: "Logic Master 🧩",
          emoji: "🧩",
          description: "Develop problem-solving and logical thinking!",
          gameType: "pattern-recognition",
          difficulty,
          ageGroup: [ageGroup],
          subjects: ["Logic"],
          pointsPerCorrect: 25,
          maxPoints: difficulty === "Easy" ? 150 : difficulty === "Medium" ? 300 : 375,
          color: "from-red-400 to-pink-500",
          instructions: "Solve patterns and improve logical thinking!"
        });
      }
      
      if (goal.toLowerCase().includes("speed") || goal.toLowerCase().includes("quick")) {
        // Add speed-focused games
        games.push({
          id: "goal-speed-quiz",
          title: "Speed Challenge ⚡",
          emoji: "⚡",
          description: "Quick thinking and fast responses!",
          gameType: "quiz",
          difficulty,
          ageGroup: [ageGroup],
          subjects: ["General"],
          pointsPerCorrect: 10,
          maxPoints: difficulty === "Easy" ? 60 : difficulty === "Medium" ? 80 : 60,
          color: "from-yellow-300 to-amber-500",
          instructions: "Answer as quickly as possible!"
        });
      }
    });
  }

  // Remove duplicates based on gameType and subject combination
  const uniqueGames = games.filter((game, index, self) =>
    index === self.findIndex((g) => 
      g.gameType === game.gameType && 
      g.subjects[0] === game.subjects[0]
    )
  );

  // Limit games based on age (younger = fewer games to avoid overwhelm)
  const gameLimit = age <= 9 ? 6 : age <= 11 ? 8 : age <= 14 ? 10 : 12;
  
  return uniqueGames.slice(0, gameLimit);
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
