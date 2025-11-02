import { UserProfile } from "@/contexts/UserProfileContext";

export interface GameRecommendation {
  gameId: string;
  score: number;
  reasons: string[];
}

export const getGameRecommendations = (profile: UserProfile): GameRecommendation[] => {
  const recommendations: GameRecommendation[] = [
    { gameId: "city-village", score: 0, reasons: [] },
    { gameId: "farm-market", score: 0, reasons: [] },
    { gameId: "rural-urban", score: 0, reasons: [] },
    { gameId: "eco-challenge", score: 0, reasons: [] },
    { gameId: "my-world", score: 0, reasons: [] },
    { gameId: "build-community", score: 0, reasons: [] },
  ];

  // Interest-based recommendations
  profile.interests.forEach((interest) => {
    switch (interest.toLowerCase()) {
      case "environment":
        recommendations.find(r => r.gameId === "eco-challenge")!.score += 3;
        recommendations.find(r => r.gameId === "eco-challenge")!.reasons.push("Matches your interest in Environment");
        recommendations.find(r => r.gameId === "build-community")!.score += 1;
        break;
      case "agriculture":
        recommendations.find(r => r.gameId === "farm-market")!.score += 3;
        recommendations.find(r => r.gameId === "farm-market")!.reasons.push("Perfect for learning about Agriculture");
        recommendations.find(r => r.gameId === "city-village")!.score += 2;
        break;
      case "technology":
        recommendations.find(r => r.gameId === "build-community")!.score += 2;
        recommendations.find(r => r.gameId === "build-community")!.reasons.push("Involves smart city technology");
        recommendations.find(r => r.gameId === "city-village")!.score += 1;
        break;
      case "economy":
        recommendations.find(r => r.gameId === "farm-market")!.score += 3;
        recommendations.find(r => r.gameId === "farm-market")!.reasons.push("Great for understanding Economics");
        break;
      case "teamwork":
        recommendations.find(r => r.gameId === "rural-urban")!.score += 3;
        recommendations.find(r => r.gameId === "rural-urban")!.reasons.push("Focuses on Teamwork skills");
        break;
      case "storytelling":
        recommendations.find(r => r.gameId === "my-world")!.score += 3;
        recommendations.find(r => r.gameId === "my-world")!.reasons.push("Perfect for Storytelling lovers");
        break;
      case "art":
      case "design":
        recommendations.find(r => r.gameId === "build-community")!.score += 3;
        recommendations.find(r => r.gameId === "build-community")!.reasons.push("Involves creative Design thinking");
        recommendations.find(r => r.gameId === "my-world")!.score += 1;
        break;
      case "math":
      case "science":
        recommendations.find(r => r.gameId === "farm-market")!.score += 2;
        recommendations.find(r => r.gameId === "eco-challenge")!.score += 2;
        break;
    }
  });

  // Goal-based recommendations
  profile.learningGoals.forEach((goal) => {
    const goalLower = goal.toLowerCase();
    
    if (goalLower.includes("teamwork") || goalLower.includes("collaboration")) {
      recommendations.find(r => r.gameId === "rural-urban")!.score += 3;
      recommendations.find(r => r.gameId === "rural-urban")!.reasons.push("Aligns with your teamwork goals");
    }
    
    if (goalLower.includes("farming") || goalLower.includes("agriculture")) {
      recommendations.find(r => r.gameId === "farm-market")!.score += 3;
      recommendations.find(r => r.gameId === "farm-market")!.reasons.push("Helps you learn about farming");
    }
    
    if (goalLower.includes("problem") || goalLower.includes("solving")) {
      recommendations.find(r => r.gameId === "city-village")!.score += 2;
      recommendations.find(r => r.gameId === "build-community")!.score += 2;
    }
    
    if (goalLower.includes("environment") || goalLower.includes("sustainability")) {
      recommendations.find(r => r.gameId === "eco-challenge")!.score += 3;
      recommendations.find(r => r.gameId === "eco-challenge")!.reasons.push("Supports your environmental learning goals");
    }
    
    if (goalLower.includes("creativity") || goalLower.includes("creative")) {
      recommendations.find(r => r.gameId === "my-world")!.score += 2;
      recommendations.find(r => r.gameId === "build-community")!.score += 2;
    }
    
    if (goalLower.includes("rural") || goalLower.includes("urban") || goalLower.includes("city") || goalLower.includes("village")) {
      recommendations.find(r => r.gameId === "city-village")!.score += 3;
      recommendations.find(r => r.gameId === "city-village")!.reasons.push("Explores rural-urban differences");
    }
    
    if (goalLower.includes("planning") || goalLower.includes("design")) {
      recommendations.find(r => r.gameId === "build-community")!.score += 3;
      recommendations.find(r => r.gameId === "build-community")!.reasons.push("Develops planning and design skills");
    }
    
    if (goalLower.includes("communication") || goalLower.includes("empathy")) {
      recommendations.find(r => r.gameId === "my-world")!.score += 3;
      recommendations.find(r => r.gameId === "my-world")!.reasons.push("Improves communication and empathy");
    }
  });

  // Age-based adjustments
  const ageGroup = profile.ageGroup;
  if (ageGroup === "6-8" || ageGroup === "9-11") {
    // Younger students - boost easier, more creative games
    recommendations.find(r => r.gameId === "my-world")!.score += 1;
    recommendations.find(r => r.gameId === "eco-challenge")!.score += 1;
  } else if (ageGroup === "15-17" || ageGroup === "18+") {
    // Older students - boost more complex games
    recommendations.find(r => r.gameId === "build-community")!.score += 1;
    recommendations.find(r => r.gameId === "farm-market")!.score += 1;
  }

  // Sort by score (highest first)
  recommendations.sort((a, b) => b.score - a.score);

  // Deduplicate reasons
  recommendations.forEach(rec => {
    rec.reasons = [...new Set(rec.reasons)];
  });

  return recommendations;
};

export const getPersonalizedWelcome = (profile: UserProfile): string => {
  const name = profile.nickname || profile.name;
  const primaryInterest = profile.interests[0];
  
  const welcomeMessages = [
    `Hi ${name}! Ready to explore how ${primaryInterest} shapes both rural and urban life?`,
    `Welcome back, ${name}! Let's continue your ${primaryInterest} learning adventure!`,
    `Hey ${name}! Excited to see your passion for ${primaryInterest} in action!`,
    `${name}, let's dive into the world of ${primaryInterest} together!`
  ];

  return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
};

export const getPersonalizedGameIntro = (gameId: string, profile: UserProfile): string => {
  const name = profile.nickname || profile.name;
  
  const intros: Record<string, string> = {
    "city-village": `Hi ${name}! Ready to explore the fascinating differences between villages and cities? Your journey as an explorer begins now!`,
    "farm-market": `Welcome, ${name}! Time to manage the journey from farm to market. Can you handle the challenges of the supply chain?`,
    "rural-urban": `${name}, let's work together! This game is all about collaboration between rural and urban teams. Your teamwork skills will shine!`,
    "eco-challenge": `Hey ${name}! Ready to become an environmental hero? Let's tackle real-world sustainability challenges together!`,
    "my-world": `${name}, everyone has a unique story! Share yours and discover how others live. Let's build empathy and understanding!`,
    "build-community": `${name}, you're the community planner now! Design amazing spaces that benefit everyone. Let your creativity flow!`
  };

  return intros[gameId] || `Welcome, ${name}! Let's start this exciting learning adventure!`;
};

export const getMotivationalMessage = (profile: UserProfile): string => {
  const messages = [
    `${profile.completedChallenges} challenges completed! You're on fire! 🔥`,
    `Amazing progress, ${profile.nickname}! Keep up the great work! 💪`,
    `${profile.totalPoints} points earned! You're a learning champion! 🏆`,
    `Your dedication to ${profile.interests[0]} is inspiring! ⭐`,
    `You're making great strides in your learning journey! 🚀`
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};
