import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserProfile } from "@/contexts/UserProfileContext";
import UserProfileForm from "@/components/UserProfileForm";
import PersonalizedDashboard from "@/components/PersonalizedDashboard";
import { Button } from "@/components/ui/button";
import { Home, Trophy, User, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PersonalizedGame = () => {
  const { userProfile, isProfileComplete } = useUserProfile();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(!isProfileComplete);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    setShowForm(!isProfileComplete);
  }, [isProfileComplete]);

  const handleProfileUpdate = () => {
    setShowEditDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Custom Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {t("game.my_games")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="rounded-full"
              title={t("game.home_tooltip")}
            >
              <Home className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/gamification")}
              className="rounded-full"
              title={t("game.leaderboard_tooltip")}
            >
              <Trophy className="h-5 w-5" />
            </Button>

            <LanguageSwitcher />
            <ThemeToggle />

            {isProfileComplete && (
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    title={t("game.edit_profile_tooltip")}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t("game.edit_profile_title")}</DialogTitle>
                  </DialogHeader>
                  <UserProfileForm onComplete={handleProfileUpdate} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <UserProfileForm onComplete={() => setShowForm(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PersonalizedDashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalizedGame;
