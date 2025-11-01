import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Loader2, Sparkles, Trash2, History, BookOpen, Brain, Lightbulb, Plus, Menu, X, Radio } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatSessionSummary {
  id: string;
  session_id: string;
  chat_name: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  preview: string;
}

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSessionSummary[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Learning Path state
  const [learningPathLevel, setLearningPathLevel] = useState("Beginner");
  const [learningPathSubjects, setLearningPathSubjects] = useState("");
  const [learningPathWeakAreas, setLearningPathWeakAreas] = useState("");
  const [learningPathStyle, setLearningPathStyle] = useState("Visual");
  const [learningPathResult, setLearningPathResult] = useState("");

  // Feedback state
  const [feedbackQuestion, setFeedbackQuestion] = useState("");
  const [feedbackStudentAnswer, setFeedbackStudentAnswer] = useState("");
  const [feedbackCorrectAnswer, setFeedbackCorrectAnswer] = useState("");
  const [feedbackResult, setFeedbackResult] = useState("");

  // Explain state
  const [explainConcept, setExplainConcept] = useState("");
  const [explainLevel, setExplainLevel] = useState("medium");
  const [explainResult, setExplainResult] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user]);

  const loadChatSessions = async () => {
    if (!user) return;
    try {
      const sessions = await api.getStudentChatSessions(user.id);
      setChatSessions(sessions);
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
    }
  };

  const loadChatSession = async (session_id: string) => {
    try {
      setIsLoading(true);
      const session = await api.getChatSession(session_id);
      setMessages(session.messages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: msg.timestamp
      })));
      setSessionId(session_id);
      setIsSidebarOpen(false);
      toast.success("Chat session loaded");
    } catch (error) {
      toast.error("Failed to load chat session");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChatSession = async (session_id: string) => {
    try {
      await api.deleteChatSession(session_id);
      setChatSessions(chatSessions.filter(s => s.session_id !== session_id));
      if (sessionId === session_id) {
        setMessages([]);
        setSessionId(null);
      }
      toast.success("Chat session deleted");
    } catch (error) {
      toast.error("Failed to delete chat session");
      console.error(error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const data = await api.chatbotAsk(currentInput);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setSessionId(data.session_id);
      loadChatSessions();
    } catch (error: any) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetLearningPath = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const subjects = learningPathSubjects.split(",").map(s => s.trim());
      const weakAreas = learningPathWeakAreas.split(",").map(s => s.trim());
      
      const data = await api.getLearningPath({
        student_id: user.id,
        level: learningPathLevel,
        subjects,
        weak_areas: weakAreas,
        learning_style: learningPathStyle,
      });
      
      setLearningPathResult(data.learning_path);
      toast.success("Learning path generated!");
    } catch (error) {
      toast.error("Failed to generate learning path");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetFeedback = async () => {
    setIsLoading(true);
    try {
      const data = await api.getFeedback({
        question: feedbackQuestion,
        student_answer: feedbackStudentAnswer,
        correct_answer: feedbackCorrectAnswer,
      });
      
      setFeedbackResult(data.feedback);
      toast.success("Feedback generated!");
    } catch (error) {
      toast.error("Failed to get feedback");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainConcept = async () => {
    setIsLoading(true);
    try {
      const data = await api.explainConcept({
        concept: explainConcept,
        difficulty_level: explainLevel,
      });
      
      setExplainResult(data.explanation);
      toast.success("Concept explained!");
    } catch (error) {
      toast.error("Failed to explain concept");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setIsSidebarOpen(false);
    toast.success("New chat started");
  };

  const ChatSidebar = () => (
    <div className="flex flex-col h-full bg-muted/30">
      <div className="p-4 border-b">
        <Button onClick={handleNewChat} className="w-full" variant="default">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {chatSessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No previous chats
              </p>
            </div>
          ) : (
            chatSessions.map((session) => (
              <div
                key={session.session_id}
                className={cn(
                  "group relative rounded-lg p-3 cursor-pointer transition-all hover:bg-accent",
                  sessionId === session.session_id && "bg-accent"
                )}
                onClick={() => loadChatSession(session.session_id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1 line-clamp-1">
                      {session.chat_name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                      {session.preview}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>{session.message_count}</span>
                      <span>•</span>
                      <span>{new Date(session.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChatSession(session.session_id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          {chatSessions.length} {chatSessions.length === 1 ? 'conversation' : 'conversations'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-between animate-fade-up">
            <div className="flex items-center gap-4">
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/20">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <ChatSidebar />
                </SheetContent>
              </Sheet>
              
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MessageSquare className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">AI Learning Assistant</h1>
                <p className="text-white/90 text-sm md:text-base">Ask questions, get instant answers</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <Button 
                onClick={() => window.location.href = '/voice-chat'} 
                variant="secondary" 
                className="gap-2"
              >
                <Radio className="h-4 w-4" />
                Voice Assistant
              </Button>
              <Button 
                onClick={handleNewChat} 
                variant="secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 border-r bg-muted/30">
          <ChatSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="container mx-auto px-4 py-6 h-full flex flex-col">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="chat" className="text-xs md:text-sm">
                  <MessageSquare className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="learning-path" className="text-xs md:text-sm">
                  <BookOpen className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Learning Path</span>
                </TabsTrigger>
                <TabsTrigger value="feedback" className="text-xs md:text-sm">
                  <Brain className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Feedback</span>
                </TabsTrigger>
                <TabsTrigger value="explain" className="text-xs md:text-sm">
                  <Lightbulb className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Explain</span>
                </TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
                <div className="flex-1 flex flex-col bg-background rounded-lg border">
                  <ScrollArea className="flex-1 p-4">
                    <div className="max-w-3xl mx-auto space-y-6">
                      {messages.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Sparkles className="h-10 w-10 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
                          <p className="text-muted-foreground max-w-md mx-auto">
                            Ask me anything about programming, data science, or any learning topic
                          </p>
                        </div>
                      ) : (
                        messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={message.role === "user" ? "secondary" : "outline"} className="text-xs">
                                  {message.role === "user" ? "You" : "AI"}
                                </Badge>
                              </div>
                              <div className={`prose prose-sm max-w-none ${message.role === "user" ? "prose-invert" : "dark:prose-invert"}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      {isLoading && (
                        <div className="flex justify-start animate-fade-up">
                          <div className="bg-muted rounded-2xl px-4 py-3">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="border-t p-4">
                    <div className="max-w-3xl mx-auto flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Learning Path Tab */}
              <TabsContent value="learning-path" className="flex-1 mt-0">
                <Card className="animate-fade-up h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Personalized Learning Path
                    </CardTitle>
                    <CardDescription>
                      Get a customized learning path based on your preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Level</Label>
                        <Select value={learningPathLevel} onValueChange={setLearningPathLevel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Learning Style</Label>
                        <Select value={learningPathStyle} onValueChange={setLearningPathStyle}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Visual">Visual</SelectItem>
                            <SelectItem value="Auditory">Auditory</SelectItem>
                            <SelectItem value="Reading">Reading/Writing</SelectItem>
                            <SelectItem value="Kinesthetic">Kinesthetic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Subjects (comma-separated)</Label>
                      <Input
                        placeholder="e.g., Python, Data Science, Machine Learning"
                        value={learningPathSubjects}
                        onChange={(e) => setLearningPathSubjects(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Weak Areas (comma-separated)</Label>
                      <Input
                        placeholder="e.g., Statistics, Linear Algebra"
                        value={learningPathWeakAreas}
                        onChange={(e) => setLearningPathWeakAreas(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleGetLearningPath} disabled={isLoading} className="w-full">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BookOpen className="h-4 w-4 mr-2" />}
                      Generate Learning Path
                    </Button>
                    {learningPathResult && (
                      <ScrollArea className="h-[400px] rounded-lg border p-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {learningPathResult}
                          </ReactMarkdown>
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Feedback Tab */}
              <TabsContent value="feedback" className="flex-1 mt-0">
                <Card className="animate-fade-up h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Answer Feedback
                    </CardTitle>
                    <CardDescription>
                      Get detailed feedback on your answers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Input
                        placeholder="Enter the question"
                        value={feedbackQuestion}
                        onChange={(e) => setFeedbackQuestion(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Your Answer</Label>
                      <Textarea
                        placeholder="Enter your answer"
                        value={feedbackStudentAnswer}
                        onChange={(e) => setFeedbackStudentAnswer(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <Textarea
                        placeholder="Enter the correct answer"
                        value={feedbackCorrectAnswer}
                        onChange={(e) => setFeedbackCorrectAnswer(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleGetFeedback} disabled={isLoading} className="w-full">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                      Get Feedback
                    </Button>
                    {feedbackResult && (
                      <ScrollArea className="h-[300px] rounded-lg border p-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {feedbackResult}
                          </ReactMarkdown>
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Explain Tab */}
              <TabsContent value="explain" className="flex-1 mt-0">
                <Card className="animate-fade-up h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      Concept Explanation
                    </CardTitle>
                    <CardDescription>
                      Get detailed explanations of any concept
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Concept</Label>
                      <Input
                        placeholder="e.g., Recursion in programming"
                        value={explainConcept}
                        onChange={(e) => setExplainConcept(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty Level</Label>
                      <Select value={explainLevel} onValueChange={setExplainLevel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleExplainConcept} disabled={isLoading} className="w-full">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lightbulb className="h-4 w-4 mr-2" />}
                      Explain Concept
                    </Button>
                    {explainResult && (
                      <ScrollArea className="h-[400px] rounded-lg border p-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {explainResult}
                          </ReactMarkdown>
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
