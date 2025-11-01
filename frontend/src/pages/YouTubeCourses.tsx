import { useEffect, useState } from "react";
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
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      toast.success(`Found ${response.total_results} videos`);
    } catch (error: any) {
      toast.error("Failed to search YouTube");
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
      toast.success(`Found ${response.videos.length} videos using AI-generated keywords`);
    } catch (error: any) {
      toast.error("Failed to search YouTube with AI");
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

  const openVideo = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <Youtube className="h-10 w-10" />
              <h1 className="text-3xl sm:text-4xl font-bold">YouTube Learning Hub</h1>
            </div>
            <p className="text-white/90 text-lg">
              Discover educational videos powered by AI keyword generation
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search for Educational Content</CardTitle>
            <CardDescription>
              Choose between AI-powered search with automatic keyword generation or manual search
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter topic (e.g., 'Python programming', 'Data structures')"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAISearch()}
                      className="flex-1"
                    />
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

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAISearch}
                      disabled={isLoading || !searchQuery.trim()}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          AI Search
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleGenerateKeywords}
                      disabled={isGeneratingKeywords || !searchQuery.trim()}
                    >
                      {isGeneratingKeywords ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Generate Keywords
                        </>
                      )}
                    </Button>
                  </div>

                  {aiKeywords.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">AI-Generated Keywords:</p>
                      <div className="flex flex-wrap gap-2">
                        {aiKeywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                            {keyword}
                          </Badge>
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
                      placeholder="Search YouTube..."
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

        {/* Results */}
        {videos.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Found {videos.length} Educational Videos
              </h2>
              <Badge variant="outline">{activeTab === "ai" ? "AI-Powered" : "Manual Search"}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="relative aspect-video" onClick={() => openVideo(video.url)}>
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                    {video.duration && (
                      <Badge className="absolute bottom-2 right-2 bg-black/80">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(video.duration)}
                      </Badge>
                    )}
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      {video.channel}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {video.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {formatNumber(video.view_count)}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {formatNumber(video.like_count)}
                      </div>
                    </div>
                    
                    <Button
                      className="w-full mt-4"
                      variant="outline"
                      onClick={() => openVideo(video.url)}
                    >
                      <Youtube className="mr-2 h-4 w-4" />
                      Watch on YouTube
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          !isLoading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No videos found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Try searching for a topic or use AI-powered search to discover educational content
                </p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

export default YouTubeCourses;
