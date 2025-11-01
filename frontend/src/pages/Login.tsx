import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, GraduationCap, UserCircle, BookOpen, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | "admin">("student");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-12">
      <Card className="w-full max-w-md animate-scale-in shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{t("auth.welcome_back")}</CardTitle>
          <CardDescription>
            {t("auth.sign_in_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("auth.password_placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                  {t("auth.signing_in")}
                </>
              ) : (
                t("auth.sign_in")
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t("auth.no_account")} </span>
            <Link to="/register" className="text-primary hover:underline font-medium">
              {t("auth.sign_up")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
