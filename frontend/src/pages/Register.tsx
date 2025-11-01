import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, GraduationCap, UserCircle, BookOpen, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    college_name: "",
    class_grade: "",
    major_subject: "",
    phone_number: "",
    city: "",
    state: "",
    goals: "",
  });
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | "admin">("student");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register({
        ...formData,
        role: selectedRole,
        interests,
        learning_preferences: ["visual", "interactive"],
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-12">
      <Card className="w-full max-w-2xl animate-scale-in shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{t("auth.create_account")}</CardTitle>
          <CardDescription>
            {t("auth.sign_up_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>{t("auth.i_am_a")}</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={selectedRole === "student" ? "default" : "outline"}
                  className={cn(
                    "flex flex-col items-center justify-center h-20 gap-1",
                    selectedRole === "student" && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedRole("student")}
                  disabled={isLoading}
                >
                  <UserCircle className="h-5 w-5" />
                  <span className="text-xs">{t("auth.student")}</span>
                </Button>
                
                <Button
                  type="button"
                  variant={selectedRole === "teacher" ? "default" : "outline"}
                  className={cn(
                    "flex flex-col items-center justify-center h-20 gap-1",
                    selectedRole === "teacher" && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedRole("teacher")}
                  disabled={isLoading}
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="text-xs">{t("auth.teacher")}</span>
                </Button>
                
                <Button
                  type="button"
                  variant={selectedRole === "admin" ? "default" : "outline"}
                  className={cn(
                    "flex flex-col items-center justify-center h-20 gap-1",
                    selectedRole === "admin" && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedRole("admin")}
                  disabled={isLoading}
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-xs">{t("auth.admin")}</span>
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">{t("auth.full_name")} *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder={t("auth.full_name_placeholder")}
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")} *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("auth.email_placeholder")}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")} *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t("auth.password_placeholder")}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  placeholder="+1234567890"
                  value={formData.phone_number}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="college_name">College/University</Label>
                <Input
                  id="college_name"
                  name="college_name"
                  placeholder="Example University"
                  value={formData.college_name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class_grade">Class/Grade</Label>
                <Input
                  id="class_grade"
                  name="class_grade"
                  placeholder="3rd Year"
                  value={formData.class_grade}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="major_subject">Major Subject</Label>
                <Input
                  id="major_subject"
                  name="major_subject"
                  placeholder="Computer Science"
                  value={formData.major_subject}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="San Francisco"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="California"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests</Label>
              <div className="flex gap-2">
                <Input
                  id="interests"
                  placeholder="e.g., AI, Web Development"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                  disabled={isLoading}
                />
                <Button type="button" onClick={addInterest} disabled={isLoading} variant="secondary">
                  Add
                </Button>
              </div>
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="cursor-pointer" onClick={() => removeInterest(interest)}>
                      {interest} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Learning Goals</Label>
              <Input
                id="goals"
                name="goals"
                placeholder="Master full-stack development"
                value={formData.goals}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.creating_account")}
                </>
              ) : (
                t("auth.create_account")
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t("auth.already_have_account")} </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t("auth.sign_in_link")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
