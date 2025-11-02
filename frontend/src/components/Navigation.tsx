import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, User, BookOpen, LayoutDashboard, Shield, MessageSquare, Brain, Award, Radio, Youtube, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const Navigation = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;
  const { t } = useTranslation();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl hidden sm:inline">Edusaathi</span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Desktop Navigation - Order: Dashboard, AI Chat, Game, Adaptive, Language, Dark Mode, Profile */}
              <div className="hidden lg:flex items-center gap-2">
                <Button
                  variant={isActive("/dashboard") ? "default" : "ghost"}
                  asChild
                  size="sm"
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t("nav.dashboard")}
                  </Link>
                </Button>
                <Button
                  variant={isActive("/chatbot") ? "default" : "ghost"}
                  asChild
                  size="sm"
                >
                  <Link to="/chatbot">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t("nav.ai_chat")}
                  </Link>
                </Button>
                <Button
                  variant={isActive("/personalized-game") ? "default" : "ghost"}
                  asChild
                  size="sm"
                  className="bg-gradient-to-r from-primary/10 to-purple-600/10 hover:from-primary/20 hover:to-purple-600/20"
                >
                  <Link to="/personalized-game">
                    <Award className="h-4 w-4 mr-2" />
                    {t("game.my_games")}
                  </Link>
                </Button>
                {user?.role === "student" && (
                  <Button
                    variant={isActive("/adaptive-learning") ? "default" : "ghost"}
                    asChild
                    size="sm"
                  >
                    <Link to="/adaptive-learning">
                      <Brain className="h-4 w-4 mr-2" />
                        {t("nav.adaptive")}
                    </Link>
                  </Button>
                )}
                {user?.role === "admin" && (
                  <Button
                    variant={isActive("/admin") ? "default" : "ghost"}
                    asChild
                    size="sm"
                  >
                    <Link to="/admin">
                      <Shield className="h-4 w-4 mr-2" />
                        {t("nav.admin")}
                    </Link>
                  </Button>
                )}
              </div>

              {/* Mobile/Tablet - Show only AI Chat, Dark Mode, and Hamburger Menu */}
              <div className="flex lg:hidden items-center gap-2">
                <Button
                  variant={isActive("/chatbot") ? "default" : "ghost"}
                  asChild
                  size="sm"
                >
                  <Link to="/chatbot">
                    <MessageSquare className="h-4 w-4" />
                  </Link>
                </Button>
                <ThemeToggle />
                
                {/* Sidebar Menu */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <div className="flex flex-col gap-4 mt-8">
                      <h2 className="text-lg font-semibold mb-4">{t("nav.dashboard")}</h2>
                      
                      <Button
                        variant={isActive("/dashboard") ? "default" : "ghost"}
                        asChild
                        className="justify-start"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Link to="/dashboard">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          {t("nav.dashboard")}
                        </Link>
                      </Button>
                      
                      <Button
                        variant={isActive("/chatbot") ? "default" : "ghost"}
                        asChild
                        className="justify-start"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Link to="/chatbot">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {t("nav.ai_chat")}
                        </Link>
                      </Button>
                      
                      <Button
                        variant={isActive("/personalized-game") ? "default" : "ghost"}
                        asChild
                        className="justify-start bg-gradient-to-r from-primary/10 to-purple-600/10 hover:from-primary/20 hover:to-purple-600/20"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Link to="/personalized-game">
                          <Award className="h-4 w-4 mr-2" />
                          {t("game.my_games")}
                        </Link>
                      </Button>
                      
                      {user?.role === "student" && (
                        <Button
                          variant={isActive("/adaptive-learning") ? "default" : "ghost"}
                          asChild
                          className="justify-start"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Link to="/adaptive-learning">
                            <Brain className="h-4 w-4 mr-2" />
                            {t("nav.adaptive")}
                          </Link>
                        </Button>
                      )}
                      
                      {user?.role === "admin" && (
                        <Button
                          variant={isActive("/admin") ? "default" : "ghost"}
                          asChild
                          className="justify-start"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Link to="/admin">
                            <Shield className="h-4 w-4 mr-2" />
                            {t("nav.admin")}
                          </Link>
                        </Button>
                      )}
                      
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium">{t("nav.profile")}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col space-y-1 p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium">{user?.full_name}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                          </div>
                          <Button
                            variant="ghost"
                            className="justify-start"
                            asChild
                            onClick={() => setSidebarOpen(false)}
                          >
                            <Link to="/profile">
                              <User className="h-4 w-4 mr-2" />
                              {t("nav.profile")}
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start text-destructive hover:text-destructive"
                            onClick={() => {
                              setSidebarOpen(false);
                              handleLogout();
                            }}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            {t("nav.logout")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop - Language, Theme, Profile */}
              <div className="hidden lg:flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium">{user?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User className="mr-2 h-4 w-4" />
                        {t("nav.profile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("nav.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <Button variant="ghost" asChild size="sm">
                <Link to="/login">{t("nav.login")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">{t("nav.signup")}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
