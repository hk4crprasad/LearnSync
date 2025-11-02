import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserProfile, UserProfile } from "@/contexts/UserProfileContext";
import { Sparkles, User, Target, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface UserProfileFormProps {
  onComplete: () => void;
}

const UserProfileForm = ({ onComplete }: UserProfileFormProps) => {
  const { setUserProfile } = useUserProfile();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Define interests with translation keys
  const interests = [
    { id: "environment", label: t("profile.interest_environment"), value: "Environment" },
    { id: "agriculture", label: t("profile.interest_agriculture"), value: "Agriculture" },
    { id: "technology", label: t("profile.interest_technology"), value: "Technology" },
    { id: "math", label: t("profile.interest_math"), value: "Math" },
    { id: "art", label: t("profile.interest_art"), value: "Art" },
    { id: "storytelling", label: t("profile.interest_storytelling"), value: "Storytelling" },
    { id: "economy", label: t("profile.interest_economy"), value: "Economy" },
    { id: "teamwork", label: t("profile.interest_teamwork"), value: "Teamwork" },
    { id: "design", label: t("profile.interest_design"), value: "Design" },
    { id: "science", label: t("profile.interest_science"), value: "Science" }
  ];

  const learningGoalOptions = [
    t("profile.goal_teamwork"),
    t("profile.goal_farming"),
    t("profile.goal_problem_solving"),
    t("profile.goal_environment"),
    t("profile.goal_creativity"),
    t("profile.goal_rural_urban"),
    t("profile.goal_planning"),
    t("profile.goal_communication"),
    t("profile.goal_sustainability")
  ];
  
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    ageGroup: "",
    selectedInterests: [] as string[],
    selectedGoals: [] as string[],
    customGoal: ""
  });

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      selectedInterests: prev.selectedInterests.includes(interest)
        ? prev.selectedInterests.filter(i => i !== interest)
        : [...prev.selectedInterests, interest]
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(goal)
        ? prev.selectedGoals.filter(g => g !== goal)
        : [...prev.selectedGoals, goal]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.ageGroup || formData.selectedInterests.length === 0) {
      toast({
        title: t("profile.missing_info"),
        description: t("profile.missing_info_desc"),
        variant: "destructive"
      });
      return;
    }

    const goals = [...formData.selectedGoals];
    if (formData.customGoal.trim()) {
      goals.push(formData.customGoal.trim());
    }

    const profile: UserProfile = {
      name: formData.name,
      nickname: formData.nickname || formData.name,
      ageGroup: formData.ageGroup,
      interests: formData.selectedInterests,
      learningGoals: goals,
      avatar: "default",
      completedChallenges: 0,
      totalPoints: 0,
      completedGames: [],
      currentLevel: {},
      gameProgress: {}
    };

    setUserProfile(profile);
    toast({
      title: t("profile.profile_created"),
      description: t("profile.welcome_message", { nickname: profile.nickname })
    });
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-6"
    >
      <Card className="border-2 border-primary/20 shadow-xl">
        <CardHeader className="text-center pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center mb-4"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {t("profile.welcome_title")}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {t("profile.welcome_subtitle")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Section */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{t("profile.about_you")}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t("profile.full_name")} {t("profile.required")}</Label>
                  <Input
                    id="name"
                    placeholder={t("profile.full_name_placeholder")}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="nickname">{t("profile.nickname")}</Label>
                  <Input
                    id="nickname"
                    placeholder={t("profile.nickname_placeholder")}
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ageGroup">{t("profile.age_group")} {t("profile.required")}</Label>
                <Select
                  value={formData.ageGroup}
                  onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t("profile.age_group_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6-8">{t("profile.age_6_8")}</SelectItem>
                    <SelectItem value="9-11">{t("profile.age_9_11")}</SelectItem>
                    <SelectItem value="12-14">{t("profile.age_12_14")}</SelectItem>
                    <SelectItem value="15-17">{t("profile.age_15_17")}</SelectItem>
                    <SelectItem value="18+">{t("profile.age_18_plus")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Interests Section */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{t("profile.your_interests")} {t("profile.required")}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t("profile.interests_subtitle")}</p>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge
                    key={interest.id}
                    variant={formData.selectedInterests.includes(interest.value) ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 ${
                      formData.selectedInterests.includes(interest.value)
                        ? "bg-primary hover:bg-primary/90"
                        : "hover:bg-primary/10"
                    }`}
                    onClick={() => handleInterestToggle(interest.value)}
                  >
                    {interest.label}
                  </Badge>
                ))}
              </div>
            </motion.div>

            {/* Learning Goals Section */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{t("profile.learning_goals")}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t("profile.learning_goals_subtitle")}</p>
              <div className="flex flex-wrap gap-2">
                {learningGoalOptions.map((goal) => (
                  <Badge
                    key={goal}
                    variant={formData.selectedGoals.includes(goal) ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 ${
                      formData.selectedGoals.includes(goal)
                        ? "bg-primary hover:bg-primary/90"
                        : "hover:bg-primary/10"
                    }`}
                    onClick={() => handleGoalToggle(goal)}
                  >
                    {goal}
                  </Badge>
                ))}
              </div>

              <div className="mt-3">
                <Label htmlFor="customGoal">{t("profile.custom_goal")}</Label>
                <Textarea
                  id="customGoal"
                  placeholder={t("profile.custom_goal_placeholder")}
                  value={formData.customGoal}
                  onChange={(e) => setFormData({ ...formData, customGoal: e.target.value })}
                  className="mt-1"
                  rows={2}
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white font-semibold"
              >
                {t("profile.start_journey")}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserProfileForm;
