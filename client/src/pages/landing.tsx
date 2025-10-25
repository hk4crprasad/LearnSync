import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Brain,
  Target,
  TrendingUp,
  Award,
  Users,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Landing() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description:
        "Adaptive algorithms that personalize your learning path based on your progress and performance.",
    },
    {
      icon: Target,
      title: "Real-Time Feedback",
      description:
        "Get instant AI-generated feedback on assessments with suggestions for improvement.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Visual dashboards show your learning journey with detailed analytics and insights.",
    },
    {
      icon: Award,
      title: "Gamification",
      description:
        "Earn points, badges, and compete on leaderboards to stay motivated.",
    },
  ];

  const stats = [
    { label: "Active Students", value: "10,000+" },
    { label: "Courses Available", value: "500+" },
    { label: "Expert Teachers", value: "200+" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">LearnAI</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={() => setLocation("/login")}
              data-testid="button-login"
            >
              Login
            </Button>
            <Button onClick={() => setLocation("/signup")} data-testid="button-signup">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center pt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl font-semibold leading-tight lg:text-6xl">
                Personalized Learning Powered by AI
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Experience adaptive education that grows with you. Our AI-driven
                platform provides personalized learning paths, real-time feedback,
                and intelligent insights to help you succeed.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => setLocation("/signup")}
                  data-testid="button-hero-start"
                >
                  Start Learning Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  data-testid="button-hero-learn"
                >
                  Learn More
                </Button>
              </div>
              <div className="flex gap-8 pt-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Brain className="h-48 w-48 text-primary opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-semibold lg:text-4xl">
              Powerful Features for Modern Learning
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to succeed in your learning journey
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="p-6 space-y-3 hover-elevate transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="order-2 lg:order-1">
              <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <BookOpen className="h-32 w-32 text-primary opacity-20" />
              </div>
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-3xl font-semibold lg:text-4xl">
                For Students
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Learn at your own pace with AI-powered personalization. Get instant
                feedback, track your progress, and compete with peers on the
                leaderboard.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <span>Adaptive learning paths tailored to you</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <span>24/7 AI tutor for instant help</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <span>Gamification to keep you motivated</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold lg:text-4xl">
                For Teachers
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Gain powerful insights into student performance. Track class
                analytics, identify at-risk students, and provide targeted support.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <span>Comprehensive analytics dashboards</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <span>AI-generated performance insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <span>Direct messaging with students</span>
                </li>
              </ul>
            </div>
            <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <Users className="h-32 w-32 text-primary opacity-20" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-semibold lg:text-4xl">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of students and teachers already using LearnAI to
              achieve their educational goals.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setLocation("/signup")}
                data-testid="button-cta-signup"
              >
                Get Started Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/login")}
                data-testid="button-cta-login"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">LearnAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Personalized learning powered by AI for students and teachers.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-3">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>About Us</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 LearnAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
