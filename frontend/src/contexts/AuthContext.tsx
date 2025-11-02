import React, { createContext, useContext, useState, useEffect } from "react";
import { User, api } from "@/lib/api";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
          // Store user ID if not already stored
          if (userData.id && !localStorage.getItem("user_id")) {
            localStorage.setItem("user_id", userData.id.toString());
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_id");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      localStorage.setItem("access_token", response.access_token);
      const userData = await api.getCurrentUser();
      setUser(userData);
      // Store user ID for profile management
      if (userData.id) {
        localStorage.setItem("user_id", userData.id.toString());
      }
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await api.register(data);
      localStorage.setItem("access_token", response.access_token);
      if (response.user) {
        setUser(response.user);
        // Store user ID for profile management
        if (response.user.id) {
          localStorage.setItem("user_id", response.user.id.toString());
        }
      } else {
        const userData = await api.getCurrentUser();
        setUser(userData);
        // Store user ID for profile management
        if (userData.id) {
          localStorage.setItem("user_id", userData.id.toString());
        }
      }
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      throw error;
    }
  };

  const logout = () => {
    // Clear authentication token
    localStorage.removeItem("access_token");
    
    // Clear user ID
    const userId = localStorage.getItem("user_id");
    localStorage.removeItem("user_id");
    
    // Clear user profile and game progress data for this user
    if (userId) {
      localStorage.removeItem(`learningGameProfile_${userId}`);
    }
    // Also clear old format for backward compatibility
    localStorage.removeItem("learningGameProfile");
    
    // Clear any other session data
    localStorage.removeItem("userPreferences");
    
    setUser(null);
    toast.info("Logged out successfully");
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const updatedUser = await api.updateProfile(data);
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Update failed");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
