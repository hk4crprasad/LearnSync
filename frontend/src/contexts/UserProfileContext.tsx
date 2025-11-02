import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
  name: string;
  nickname: string;
  ageGroup: string;
  interests: string[];
  learningGoals: string[];
  avatar: string;
  completedChallenges: number;
  totalPoints: number;
  completedGames: string[];
  currentLevel: Record<string, string>; // gameId -> levelId
  gameProgress: Record<string, {
    level: number; // 1=Easy, 2=Medium, 3=Hard
    completedAttempts: number;
    highScore: number;
  }>;
}

interface UserProfileContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  updateProgress: (gameId: string, points: number, score?: number) => void;
  isProfileComplete: boolean;
  clearProfile: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const defaultProfile: UserProfile = {
  name: "",
  nickname: "",
  ageGroup: "",
  interests: [],
  learningGoals: [],
  avatar: "default",
  completedChallenges: 0,
  totalPoints: 0,
  completedGames: [],
  currentLevel: {},
  gameProgress: {}
};

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Load profile from localStorage on mount and when user changes
  useEffect(() => {
    // Check if there's a logged-in user
    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id"); // We'll need to store this on login
    
    if (token && userId) {
      setCurrentUserId(userId);
      // Load profile specific to this user
      const savedProfile = localStorage.getItem(`learningGameProfile_${userId}`);
      if (savedProfile) {
        try {
          setUserProfileState(JSON.parse(savedProfile));
        } catch (error) {
          console.error("Error loading profile:", error);
        }
      }
    } else {
      // No user logged in, clear profile
      setCurrentUserId(null);
      setUserProfileState(null);
    }
  }, []);

  const setUserProfile = (profile: UserProfile) => {
    setUserProfileState(profile);
    // Save profile with user ID to make it user-specific
    const userId = currentUserId || localStorage.getItem("user_id") || "default";
    localStorage.setItem(`learningGameProfile_${userId}`, JSON.stringify(profile));
  };

  const updateProgress = (gameId: string, points: number, score: number = 0) => {
    if (!userProfile) return;

    const currentProgress = userProfile.gameProgress[gameId] || {
      level: 1,
      completedAttempts: 0,
      highScore: 0
    };

    // Update attempts and high score
    const newAttempts = currentProgress.completedAttempts + 1;
    const newHighScore = Math.max(currentProgress.highScore, score);
    
    // Level progression: After 3 completions of current level, unlock next level
    let newLevel = currentProgress.level;
    if (newAttempts >= 3 && newLevel < 3) {
      newLevel = currentProgress.level + 1;
      // Reset attempts for new level
    }

    const updatedProfile = {
      ...userProfile,
      totalPoints: userProfile.totalPoints + points,
      completedChallenges: userProfile.completedChallenges + 1,
      completedGames: userProfile.completedGames.includes(gameId)
        ? userProfile.completedGames
        : [...userProfile.completedGames, gameId],
      gameProgress: {
        ...userProfile.gameProgress,
        [gameId]: {
          level: newLevel,
          completedAttempts: newLevel > currentProgress.level ? 1 : newAttempts, // Reset if leveled up
          highScore: newHighScore
        }
      }
    };

    setUserProfile(updatedProfile);
  };

  const clearProfile = () => {
    setUserProfileState(null);
    // Clear profile for current user
    const userId = currentUserId || localStorage.getItem("user_id") || "default";
    localStorage.removeItem(`learningGameProfile_${userId}`);
    // Also clear the old format for backward compatibility
    localStorage.removeItem("learningGameProfile");
  };

  const isProfileComplete = !!(
    userProfile?.name &&
    userProfile?.ageGroup &&
    userProfile?.interests.length > 0
  );

  return (
    <UserProfileContext.Provider
      value={{
        userProfile,
        setUserProfile,
        updateProgress,
        isProfileComplete,
        clearProfile
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};
