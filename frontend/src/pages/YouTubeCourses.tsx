import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Loader2, 
  Youtube, 
  Sparkles, 
  Play, 
  Eye, 
  ThumbsUp, 
  Clock,
  Filter,
  BookOpen,
  TrendingUp,
  Star,
  Award,
  Flame,
  Zap,
  Trophy,
  Target,
  PlayCircle,
  Heart,
  Share2,
  Bookmark
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// Add animations styles
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
`;

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  channel_id: string;
  published_at: string;
  duration: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  url: string;
  embed_url: string;
}

const YouTubeCourses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("ai");
  const [sortOrder, setSortOrder] = useState("relevance");
  const [duration, setDuration] = useState<string>("");
  const [learningLevel, setLearningLevel] = useState("beginner");
  
  // Gamification states
  const [videosWatched, setVideosWatched] = useState(0);
  const [searchStreak, setSearchStreak] = useState(1);
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  // Load gamification data from localStorage
  useEffect(() => {
    const watched = localStorage.getItem("yt_videos_watched");
    const streak = localStorage.getItem("yt_search_streak");
    const saved = localStorage.getItem("yt_saved_videos");
    const liked = localStorage.getItem("yt_liked_videos");
    
    if (watched) setVideosWatched(parseInt(watched));
    if (streak) setSearchStreak(parseInt(streak));
    if (saved) setSavedVideos(new Set(JSON.parse(saved)));
    if (liked) setLikedVideos(new Set(JSON.parse(liked)));
  }, []);

  // Save gamification data
  const saveGamificationData = () => {
    localStorage.setItem("yt_videos_watched", videosWatched.toString());
    localStorage.setItem("yt_search_streak", searchStreak.toString());
    localStorage.setItem("yt_saved_videos", JSON.stringify(Array.from(savedVideos)));
    localStorage.setItem("yt_liked_videos", JSON.stringify(Array.from(likedVideos)));
  };

  useEffect(() => {
    saveGamificationData();
  }, [videosWatched, searchStreak, savedVideos, likedVideos]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDuration = (duration: string): string => {
    // Simple duration formatting (already formatted by backend)
    return duration;
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.searchYouTube(
        searchQuery,
        20,
        sortOrder,
        duration || undefined
      );
      setVideos(response.videos);
      setAiKeywords([]);
      
      // Gamification: Increase search streak
      setSearchStreak(prev => prev + 1);
      if (searchStreak > 0 && searchStreak % 5 === 0) {
        toast.success(`🔥 ${searchStreak} search streak! You're on fire!`, {
          duration: 3000,
        });
      }
      
      toast.success(`Found ${response.total_results} videos`);
    } catch (error: any) {
      toast.error("Failed to search videos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    try {
      setIsLoading(true);
      const userContext = `Learning level: ${learningLevel}. Looking for comprehensive educational content.`;
      
      const response = await api.aiSearchYouTube(
        searchQuery,
        userContext,
        20
      );
      
      setVideos(response.videos);
      setAiKeywords(response.keywords);
      
      // Gamification: Increase search streak
      setSearchStreak(prev => prev + 1);
      if (searchStreak > 0 && searchStreak % 5 === 0) {
        toast.success(`⚡ ${searchStreak} AI searches! You're a learning champion!`, {
          duration: 3000,
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      toast.success(`🎯 Found ${response.total_results} videos with AI-generated keywords`);
    } catch (error: any) {
      toast.error("Failed to search videos with AI");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKeywords = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    try {
      setIsGeneratingKeywords(true);
      const userContext = `Learning level: ${learningLevel}. Looking for educational tutorials and courses.`;
      
      const response = await api.generateYouTubeKeywords(searchQuery, userContext);
      setAiKeywords(response.keywords);
      toast.success(response.message);
    } catch (error: any) {
      toast.error("Failed to generate keywords");
      console.error(error);
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  const handleSearch = () => {
    if (activeTab === "ai") {
      handleAISearch();
    } else {
      handleManualSearch();
    }
  };

  const openVideo = (url: string, videoId: string) => {
    window.open(url, "_blank");
    
    // Gamification: Track videos watched
    setVideosWatched(prev => prev + 1);
    
    // Show achievement at milestones
    if ((videosWatched + 1) % 10 === 0) {
      toast.success(`🏆 ${videosWatched + 1} videos watched! Keep learning!`, {
        duration: 4000,
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const toggleSaveVideo = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
        toast.info("Video removed from saved");
      } else {
        newSet.add(videoId);
        toast.success("✅ Video saved for later!");
      }
      return newSet;
    });
  };

  const toggleLikeVideo = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
        toast.info("Like removed");
      } else {
        newSet.add(videoId);
        toast.success("❤️ Liked!");
      }
      return newSet;
    });
  };

  const shareVideo = (video: YouTubeVideo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: `Check out this educational video: ${video.title}`,
        url: video.url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(video.url);
      toast.success("📋 Link copied to clipboard!");
    }
  };

  const getProgressToNextLevel = () => {
    const nextMilestone = Math.ceil(videosWatched / 10) * 10;
    return ((videosWatched % 10) / 10) * 100;
  };

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🎉</div>
            <div className="text-4xl absolute top-20 left-20 animate-ping">⭐</div>
            <div className="text-4xl absolute bottom-20 right-20 animate-ping delay-100">✨</div>
            <div className="text-5xl absolute top-40 right-40 animate-bounce delay-200">🏆</div>
          </div>
        )}

      {/* Header with Gamification */}
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full animate-pulse" />
          <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-white rounded-full animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-white rounded-full animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 py-8 relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Title and Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 animate-fade-up">
                <div className="p-3 bg-white/10 backdrop-blur rounded-2xl">
                  <Youtube className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold">Video Learning Hub</h1>
                  <p className="text-white/80 text-sm">AI-Powered Course Discovery</p>
                </div>
              </div>
              <p className="text-white/90 text-lg max-w-xl">
                Discover amazing educational content with AI-powered search. Your learning journey starts here! 🚀
              </p>
            </div>

            {/* Right Side - Gamification Stats */}
            <div className="grid grid-cols-2 gap-4">
              {/* Videos Watched */}
              <Card className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 transition-all hover:scale-105">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="h-6 w-6 text-yellow-300" />
                    <span className="text-2xl font-bold">{videosWatched}</span>
                  </div>
                  <p className="text-sm text-white/80">Videos Watched</p>
                  <Progress value={getProgressToNextLevel()} className="mt-2 h-1" />
                  <p className="text-xs text-white/60 mt-1">
                    {10 - (videosWatched % 10)} more to next badge!
                  </p>
                </CardContent>
              </Card>

              {/* Search Streak */}
              <Card className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 transition-all hover:scale-105">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Flame className="h-6 w-6 text-orange-400 animate-pulse" />
                    <span className="text-2xl font-bold">{searchStreak}</span>
                  </div>
                  <p className="text-sm text-white/80">Search Streak</p>
                  <div className="flex gap-1 mt-2">
                    {[...Array(Math.min(5, searchStreak))].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-300 text-yellow-300" />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Saved Videos */}
              <Card className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 transition-all hover:scale-105">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Bookmark className="h-6 w-6 text-blue-300" />
                    <span className="text-2xl font-bold">{savedVideos.size}</span>
                  </div>
                  <p className="text-sm text-white/80">Saved Videos</p>
                </CardContent>
              </Card>

              {/* Liked Videos */}
              <Card className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 transition-all hover:scale-105">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="h-6 w-6 text-red-300" />
                    <span className="text-2xl font-bold">{likedVideos.size}</span>
                  </div>
                  <p className="text-sm text-white/80">Liked Videos</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats Banner */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{videos.length}</p>
              <p className="text-sm opacity-90">Videos Found</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-2" />
              <p className="text-2xl font-bold capitalize">{learningLevel}</p>
              <p className="text-sm opacity-90">Learning Level</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <Award className="h-8 w-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{aiKeywords.length}</p>
              <p className="text-sm opacity-90">AI Keywords</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{activeTab === "ai" ? "AI" : "Manual"}</p>
              <p className="text-sm opacity-90">Search Mode</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="mb-8 shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-background">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Discover Learning Content</CardTitle>
                <CardDescription className="text-base">
                  Use AI to find the perfect educational videos tailored to your needs 🎯
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "manual" | "ai")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Search
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Manual Search
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai" className="space-y-4">
                <div className="space-y-4">
                  {/* Quick Topic Suggestions */}
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">✨ Try these popular topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {["Python Programming", "Data Structures", "Machine Learning", "Web Development", "Digital Marketing", "Physics"].map((topic) => (
                        <button
                          key={topic}
                          onClick={() => setSearchQuery(topic)}
                          className="px-3 py-1 text-xs bg-background hover:bg-primary hover:text-white rounded-full border transition-all hover:scale-105"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter topic (e.g., 'Python programming', 'Data structures')"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAISearch()}
                        className="flex-1 pl-10 h-12 text-base"
                      />
                    </div>
                    <Select value={learningLevel} onValueChange={setLearningLevel}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <Button
                      onClick={handleAISearch}
                      disabled={isLoading || !searchQuery.trim()}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Searching with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          🚀 AI Search
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleGenerateKeywords}
                      disabled={isGeneratingKeywords || !searchQuery.trim()}
                      className="border-2 hover:bg-primary hover:text-white font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
                    >
                      {isGeneratingKeywords ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="mr-2 h-5 w-5" />
                          ✨ Generate Keywords
                        </>
                      )}
                    </Button>
                  </div>

                  {aiKeywords.length > 0 && (
                    <div className="space-y-3 p-4 bg-gradient-to-r from-primary/5 to-purple/5 rounded-lg border-2 border-dashed border-primary/20">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold text-primary">AI-Generated Keywords</p>
                        <span className="ml-auto text-xs bg-primary/10 px-2 py-1 rounded-full">
                          {aiKeywords.length} keywords
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aiKeywords.map((keyword, index) => (
                          <div
                            key={index}
                            className="px-3 py-1.5 bg-white dark:bg-gray-800 border-2 border-primary/30 rounded-full text-sm font-medium cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-all hover:scale-105 shadow-sm"
                            style={{
                              animationDelay: `${index * 0.1}s`,
                              animation: 'fadeInUp 0.5s ease-out forwards'
                            }}
                          >
                            {keyword}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search for videos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleManualSearch()}
                      className="flex-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Sort By</label>
                      <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="date">Upload Date</SelectItem>
                          <SelectItem value="viewCount">View Count</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Duration</label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Duration</SelectItem>
                          <SelectItem value="short">Short (&lt; 4 min)</SelectItem>
                          <SelectItem value="medium">Medium (4-20 min)</SelectItem>
                          <SelectItem value="long">Long (&gt; 20 min)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={handleManualSearch}
                        disabled={isLoading || !searchQuery.trim()}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Search
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-lg font-semibold">Searching for amazing content...</p>
                <p className="text-sm text-muted-foreground">AI is finding the best videos for you 🎯</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-5/6" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && videos.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Found {videos.length} Educational Videos
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Click on any video to start learning 📚
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {activeTab === "ai" ? "🤖 AI-Powered" : "🔍 Manual Search"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <Card 
                  key={video.id} 
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50 hover:-translate-y-1"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  {/* Thumbnail with Interactive Overlay */}
                  <div className="relative aspect-video" onClick={() => openVideo(video.url, video.id)}>
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="transform scale-75 group-hover:scale-100 transition-transform">
                        <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
                      </div>
                    </div>
                    
                    {/* Duration Badge */}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/90 text-white text-xs font-semibold flex items-center gap-1 backdrop-blur">
                        <Clock className="h-3 w-3" />
                        {formatDuration(video.duration)}
                      </div>
                    )}
                    
                    {/* Action Buttons Overlay */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className={`h-8 w-8 p-0 rounded-full shadow-lg ${
                          savedVideos.has(video.id) ? 'bg-blue-500 hover:bg-blue-600' : 'bg-white/90 hover:bg-white'
                        }`}
                        onClick={(e) => toggleSaveVideo(video.id, e)}
                      >
                        <Bookmark className={`h-4 w-4 ${savedVideos.has(video.id) ? 'fill-white text-white' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className={`h-8 w-8 p-0 rounded-full shadow-lg ${
                          likedVideos.has(video.id) ? 'bg-red-500 hover:bg-red-600' : 'bg-white/90 hover:bg-white'
                        }`}
                        onClick={(e) => toggleLikeVideo(video.id, e)}
                      >
                        <Heart className={`h-4 w-4 ${likedVideos.has(video.id) ? 'fill-white text-white' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {video.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-1 flex items-center gap-2">
                      <Youtube className="h-3 w-3" />
                      {video.channel}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                    
                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span className="font-semibold">{formatNumber(video.view_count)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span className="font-semibold">{formatNumber(video.like_count)}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                        onClick={(e) => shareVideo(video, e)}
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => openVideo(video.url, video.id)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Watch
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://youtube.com/channel/${video.channel_id}`, '_blank');
                        }}
                      >
                        <Target className="mr-2 h-4 w-4" />
                        Channel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          !isLoading && (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                  <BookOpen className="h-20 w-20 text-primary relative animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Start Your Learning Journey! 🚀
                </h3>
                <p className="text-muted-foreground text-center max-w-md mb-6 leading-relaxed">
                  Search for any topic you want to learn. Our AI will help you find the best educational videos tailored to your level!
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("Python Programming");
                      setActiveTab("ai");
                    }}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Try Python
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("Machine Learning");
                      setActiveTab("ai");
                    }}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Try Machine Learning
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
    </>
  );
};

export default YouTubeCourses;
