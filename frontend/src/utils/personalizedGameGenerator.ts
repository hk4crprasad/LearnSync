import { UserProfile } from "@/contexts/UserProfileContext";

export interface PersonalizedGame {
  id: string;
  title: string;
  emoji: string;
  description: string;
  type: "Story Adventure" | "Building/Design Simulation" | "Trading/Teamwork" | "Exploration/Discovery";
  difficulty: "Easy" | "Medium" | "Hard";
  learningOutcome: string;
  interests: string[];
  goals: string[];
  color: string;
  currentLevel?: number;
  completedLevels?: number;
  isLocked?: boolean;
}

/**
 * 🧠 Generates personalized, interactive, non-quiz games based on user profile
 * Games are story-driven, funny, and simulation-based
 */
export const generatePersonalizedGames = (profile: UserProfile): PersonalizedGame[] => {
  const { ageGroup, interests, learningGoals, name } = profile;
  const games: PersonalizedGame[] = [];
  
  // Determine age-based personality
  const isKid = ageGroup === "6–8 years" || ageGroup === "9–11 years";
  const isTeen = ageGroup === "12–14 years" || ageGroup === "15–17 years";
  const isOlder = ageGroup === "18+ years";

  // 🌾 Technology + Agriculture Games
  if (interests.includes("Technology") && interests.includes("Agriculture")) {
    games.push({
      id: "tech-farm-sim",
      title: isKid ? "🐔 WiFi Chickens Farm" : isTeen ? "🌾 Farm to Future" : "🤖 AgriTech Innovator",
      emoji: isKid ? "🐔" : "🌾",
      description: isKid 
        ? "Your chickens send funny memes when they're hungry! Use sensors and AI to keep them happy and fed. They might even learn to dance!"
        : isTeen
        ? "Design your own smart farm with AI cows, drone tractors, and a veggie app. Watch your plants send thank-you notes when watered!"
        : "Build a sustainable agritech startup. Deploy IoT sensors, analyze crop data with ML, and revolutionize farming with solar-powered automation.",
      type: "Building/Design Simulation",
      difficulty: isKid ? "Easy" : isTeen ? "Medium" : "Hard",
      learningOutcome: "Understanding how technology transforms modern agriculture and food production.",
      interests: ["Technology", "Agriculture"],
      goals: learningGoals.filter(g => g.toLowerCase().includes("planning") || g.toLowerCase().includes("design") || g.toLowerCase().includes("problem")),
      color: "from-green-500 to-yellow-500"
    });
  }

  // 🎨 Art + Technology Games
  if (interests.includes("Art") && interests.includes("Technology")) {
    games.push({
      id: "digital-art-quest",
      title: isKid ? "🎨 Rainbow Robot Studio" : isTeen ? "🖼️ Digital Art Factory" : "🎭 Creative Tech Lab",
      emoji: isKid ? "🦄" : "🎨",
      description: isKid
        ? "Help a silly robot learn to paint! Mix magic colors, create funny faces, and watch your art come alive with sparkles and giggles."
        : isTeen
        ? "Build an AR art gallery where paintings talk, dance, and tell jokes. Design interactive installations that respond to visitors' emotions!"
        : "Launch a creative technology studio. Develop AI-powered design tools, NFT art platforms, and immersive digital experiences.",
      type: "Story Adventure",
      difficulty: isKid ? "Easy" : isTeen ? "Medium" : "Hard",
      learningOutcome: "Exploring the intersection of creativity and technology through interactive art.",
      interests: ["Art", "Technology"],
      goals: learningGoals.filter(g => g.toLowerCase().includes("creativity") || g.toLowerCase().includes("design")),
      color: "from-purple-500 to-pink-500"
    });
  }

  // 🌍 Environment Games
  if (interests.includes("Environment")) {
    games.push({
      id: "eco-hero-adventure",
      title: isKid ? "🌳 Super Eco Heroes" : isTeen ? "🌍 Planet Rescue Mission" : "♻️ Climate Action Simulator",
      emoji: isKid ? "🦸" : "🌍",
      description: isKid
        ? "Team up with talking trees and recycling robots! Clean up the ocean, save penguin parties, and unlock superpowers by composting!"
        : isTeen
        ? "Lead a global environmental movement. Launch eco-projects, rally your community, and watch your impact grow as forests multiply!"
        : "Simulate climate solutions at scale. Implement renewable energy policies, carbon capture tech, and sustainable urban development.",
      type: isKid ? "Story Adventure" : "Building/Design Simulation",
      difficulty: isKid ? "Easy" : isTeen ? "Medium" : "Hard",
      learningOutcome: "Learning environmental stewardship and sustainable practices through engaging scenarios.",
      interests: ["Environment"],
      goals: learningGoals.filter(g => g.toLowerCase().includes("teamwork") || g.toLowerCase().includes("problem")),
      color: "from-emerald-500 to-teal-500"
    });
  }

  // 👥 Teamwork + Communication Games
  if (interests.includes("Teamwork") || learningGoals.some(g => g.toLowerCase().includes("teamwork"))) {
    games.push({
      id: "teamwork-tower",
      title: isKid ? "🏰 Build-a-Friend Castle" : isTeen ? "🏙️ City Makers United" : "🤝 Collaboration Hub",
      emoji: isKid ? "🏰" : "🏙️",
      description: isKid
        ? "Work with magical friends to build a castle! Each friend has special powers. Trade silly hats, share tools, and celebrate with fireworks!"
        : isTeen
        ? "Join forces with players worldwide to design the ultimate smart city. Vote on parks, solve traffic puzzles, and throw virtual block parties!"
        : "Manage a distributed team on complex projects. Balance diverse perspectives, resolve conflicts, and deliver innovative solutions collaboratively.",
      type: "Trading/Teamwork",
      difficulty: isKid ? "Easy" : isTeen ? "Medium" : "Hard",
      learningOutcome: "Developing collaboration skills, communication strategies, and shared problem-solving.",
      interests: interests.filter(i => ["Teamwork", "Design"].includes(i)),
      goals: learningGoals.filter(g => g.toLowerCase().includes("teamwork") || g.toLowerCase().includes("communication")),
      color: "from-blue-500 to-indigo-500"
    });
  }

  // 💰 Economy + Math Games
  if (interests.includes("Economy") || interests.includes("Math")) {
    games.push({
      id: "market-adventure",
      title: isKid ? "🛍️ Lemonade Empire" : isTeen ? "📈 Startup Tycoon" : "💼 Business Strategy Sim",
      emoji: isKid ? "🍋" : "📈",
      description: isKid
        ? "Sell magical lemonade to funny customers! Set prices, hire giggling helpers, and unlock secret recipes. Watch out for the grumpy cloud!"
        : isTeen
        ? "Launch your dream startup! Pitch to investors, hire quirky team members, and compete in the market. Will you be the next unicorn?"
        : "Navigate complex business scenarios. Analyze market trends, optimize operations, manage resources, and scale your enterprise strategically.",
      type: "Trading/Teamwork",
      difficulty: isKid ? "Easy" : isTeen ? "Medium" : "Hard",
      learningOutcome: "Understanding economics, entrepreneurship, and strategic decision-making.",
      interests: ["Economy", "Math"],
      goals: learningGoals.filter(g => g.toLowerCase().includes("planning") || g.toLowerCase().includes("problem")),
      color: "from-yellow-500 to-orange-500"
    });
  }

  // 📚 Storytelling Games
  if (interests.includes("Storytelling")) {
    games.push({
      id: "story-creator",
      title: isKid ? "📖 Silly Story Maker" : isTeen ? "🎭 Interactive Tale Weaver" : "✍️ Narrative Designer Studio",
      emoji: isKid ? "📖" : "🎭",
      description: isKid
        ? "Create wacky stories with talking animals! Choose silly endings, add funny sound effects, and watch your story turn into a cartoon!"
        : isTeen
        ? "Craft branching storylines where readers choose the adventure. Add plot twists, create memorable characters, and see your story go viral!"
        : "Design complex narrative structures for games, films, or interactive media. Master character arcs, pacing, and emotional resonance.",
      type: "Story Adventure",
      difficulty: isKid ? "Easy" : isTeen ? "Medium" : "Hard",
      learningOutcome: "Developing narrative skills, creativity, and understanding story structure.",
      interests: ["Storytelling", "Art"],
      goals: learningGoals.filter(g => g.toLowerCase().includes("creativity") || g.toLowerCase().includes("communication")),
      color: "from-indigo-500 to-violet-500"
    });
  }

  // 🔬 Science Games
  if (interests.includes("Science")) {
    games.push({
      id: "science-lab",
      title: isKid ? "🧪 Mad Scientist Lab" : isTeen ? "🔬 Discovery Quest" : "⚗️ Research Simulator",
      emoji: isKid ? "🧪" : "🔬",
      description: isKid
        ? "Mix potions that make things bounce, glow, or sneeze! Your assistant is a clumsy robot. Experiment with silly science and safe explosions!"
        : isTeen
        ? "Lead scientific expeditions! Discover new species, solve nature's mysteries, and publish your findings. Compete in science fairs!"
        : "Manage a research laboratory. Design experiments, analyze data, collaborate with peers, and publish groundbreaking discoveries.",
      type: "Exploration/Discovery",
      difficulty: isKid ? "Easy" : isTeen ? "Medium" : "Hard",
      learningOutcome: "Learning scientific method, experimentation, and analytical thinking.",
      interests: ["Science", "Technology"],
      goals: learningGoals.filter(g => g.toLowerCase().includes("problem") || g.toLowerCase().includes("critical")),
      color: "from-cyan-500 to-blue-500"
    });
  }

  // 🎮 Design + Planning Games
  if (interests.includes("Design") || learningGoals.some(g => g.toLowerCase().includes("design") || g.toLowerCase().includes("planning"))) {
    games.push({
      id: "design-studio",
      title: isKid ? "🏡 Dreamland Builder" : isTeen ? "🏗️ Urban Architect" : "🏛️ Systems Designer",
      emoji: isKid ? "🏡" : "🏗️",
      description: isKid
        ? "Build your dream playground! Add rainbow slides, talking swings, and cookie fountains. Make friends with friendly construction animals!"
        : isTeen
        ? "Design the perfect neighborhood! Plan parks, solve space puzzles, and create hangout spots. Balance community needs with creativity!"
        : "Architect complex systems and infrastructure. Balance sustainability, accessibility, aesthetics, and functionality in large-scale projects.",
      type: "Building/Design Simulation",
      difficulty: isKid ? "Easy" : isTeen ? "Medium" : "Hard",
      learningOutcome: "Developing design thinking, planning skills, and spatial reasoning.",
      interests: ["Design", "Art"],
      goals: learningGoals.filter(g => g.toLowerCase().includes("design") || g.toLowerCase().includes("planning")),
      color: "from-red-500 to-pink-500"
    });
  }

  // 🌐 Rural-Urban Connection Game (if interested in community/teamwork)
  if (interests.includes("Teamwork") || interests.includes("Agriculture") || learningGoals.some(g => g.toLowerCase().includes("empathy") || g.toLowerCase().includes("community"))) {
    games.push({
      id: "rural-urban-bridge",
      title: isKid ? "🚜 City & Village Friends" : isTeen ? "🌉 Bridge Builder" : "🌐 Community Connector",
      emoji: isKid ? "🚜" : "🌉",
      description: isKid
        ? "Help city kids and farm kids become best friends! Exchange funny letters, share favorite foods, and plan the ultimate playdate!"
        : isTeen
        ? "Connect rural and urban communities through creative projects. Organize cultural exchanges, solve shared problems, and build understanding!"
        : "Design initiatives bridging urban-rural divides. Facilitate resource sharing, cultural exchange, and collaborative economic development.",
      type: "Story Adventure",
      difficulty: isKid ? "Easy" : isTeen ? "Medium" : "Hard",
      learningOutcome: "Building empathy, understanding diverse perspectives, and fostering community connections.",
      interests: interests.filter(i => ["Teamwork", "Agriculture"].includes(i)),
      goals: learningGoals.filter(g => g.toLowerCase().includes("empathy") || g.toLowerCase().includes("teamwork") || g.toLowerCase().includes("communication")),
      color: "from-orange-500 to-red-500"
    });
  }

  // Score games based on interest and goal matches
  const scoredGames = games.map(game => {
    let score = 0;
    
    // Score based on interest matches
    game.interests.forEach(interest => {
      if (interests.includes(interest)) score += 3;
    });
    
    // Score based on goal matches
    game.goals.forEach(goal => {
      if (learningGoals.some(userGoal => 
        userGoal.toLowerCase().includes(goal.toLowerCase()) || 
        goal.toLowerCase().includes(userGoal.toLowerCase())
      )) {
        score += 2;
      }
    });
    
    return { ...game, score };
  });

  // Sort by score and return top 3-5 games
  const topGames = scoredGames
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return topGames;
};

/**
 * Get a personalized welcome message for the game
 */
export const getGameWelcomeMessage = (profile: UserProfile): string => {
  const { name, ageGroup } = profile;
  const firstName = name.split(" ")[0];
  
  const messages = [
    `🎮 Hey ${firstName}! Ready for some awesome adventures?`,
    `✨ Welcome back, ${firstName}! Your personalized games are ready!`,
    `🚀 ${firstName}, let's explore something amazing today!`,
    `🌟 Hey ${firstName}! Time to have some fun and learn!`,
    `🎯 ${firstName}, your custom adventures await!`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Get motivational message based on game type
 */
export const getGameMotivation = (gameType: string): string => {
  const motivations: Record<string, string[]> = {
    "Story Adventure": [
      "Every great story needs a hero... that's you! 🦸",
      "Adventure awaits! Let your imagination run wild! 🌟",
      "Ready to write your own epic tale? 📖"
    ],
    "Building/Design Simulation": [
      "Time to build something incredible! 🏗️",
      "Your creativity is your superpower! 🎨",
      "Design, create, and watch your vision come to life! ✨"
    ],
    "Trading/Teamwork": [
      "Together we're stronger! Let's collaborate! 🤝",
      "Teamwork makes the dream work! 💪",
      "Share ideas, trade resources, achieve greatness! 🌟"
    ],
    "Exploration/Discovery": [
      "Curiosity leads to amazing discoveries! 🔍",
      "Explore, discover, and unlock new knowledge! 🌍",
      "Every exploration teaches something new! 🚀"
    ]
  };
  
  const messages = motivations[gameType] || motivations["Story Adventure"];
  return messages[Math.floor(Math.random() * messages.length)];
};
