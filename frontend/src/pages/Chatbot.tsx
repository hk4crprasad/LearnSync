import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Sparkles, 
  Trash2, 
  History, 
  BookOpen, 
  Brain, 
  Lightbulb, 
  Plus, 
  Menu, 
  X, 
  Radio,
  Bot,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Zap,
  Star,
  Heart,
  Smile
} from "lucide-react";
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

// Animation styles
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes typewriter {
    from { width: 0; }
    to { width: 100%; }
  }
  
  @keyframes blink {
    50% { opacity: 0; }
  }
  
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(139, 92, 246, 0.5);
    }
    50% {
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.8);
    }
  }
`;

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  reactions?: {
    liked?: boolean;
    copied?: boolean;
  };
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

    // Add empty assistant message for streaming
    const streamingMessage: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };
    
    setMessages(prev => [...prev, streamingMessage]);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("https://bput-api.tecosys.ai/api/chatbot/ask/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: currentInput,
          session_id: sessionId,
          student_id: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.error) {
                  console.error("Stream error:", data.error);
                  throw new Error(data.error);
                }
                
                if (data.chunk !== undefined) {
                  fullResponse += data.chunk;
                  
                  // Update the streaming message
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg && lastMsg.role === "assistant") {
                      lastMsg.content = fullResponse || "...";
                      lastMsg.isStreaming = !data.done;
                    }
                    return newMessages;
                  });
                }
                
                if (data.done) {
                  if (data.session_id) {
                    setSessionId(data.session_id);
                    loadChatSessions();
                  }
                  // Ensure message is no longer streaming
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg && lastMsg.role === "assistant") {
                      lastMsg.isStreaming = false;
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                console.warn("Failed to parse SSE line:", line, e);
                // Skip invalid JSON lines
              }
            }
          }
        }
      }
      
      // Ensure we got a response
      if (!fullResponse.trim()) {
        throw new Error("No response received from AI");
      }
      
      toast.success("Response received!");
    } catch (error: any) {
      toast.error("Failed to send message");
      console.error(error);
      // Remove the failed streaming message
      setMessages(prev => prev.slice(0, -1));
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
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full animate-pulse" />
          <div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white rounded-full animate-pulse delay-700" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 border-4 border-white rounded-full animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 py-6 md:py-10 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
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
              
              <div className="relative">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-2xl border-2 border-white/30">
                  <Bot className="h-7 w-7 md:h-9 md:w-9 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl md:text-3xl font-bold">AI Learning Assistant</h1>
                  <span className="hidden md:inline-block px-2 py-1 text-xs bg-yellow-400 text-yellow-900 rounded-full font-semibold">
                    ⚡ LIVE
                  </span>
                </div>
                <p className="text-white/90 text-xs md:text-base flex items-center gap-2">
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                  Streaming responses • Powered by GPT-4
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => window.location.href = '/voice-chat'} 
                variant="secondary" 
                className="hidden md:flex gap-2 hover:scale-105 transition-transform"
              >
                <Radio className="h-4 w-4" />
                Voice Chat
              </Button>
              <Button 
                onClick={handleNewChat} 
                variant="secondary"
                className="gap-2 hover:scale-105 transition-transform"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">New Chat</span>
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2 md:gap-4 max-w-md">
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 md:p-3 text-center">
              <div className="text-lg md:text-2xl font-bold">{messages.length}</div>
              <div className="text-xs text-white/80">Messages</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 md:p-3 text-center">
              <div className="text-lg md:text-2xl font-bold">{chatSessions.length}</div>
              <div className="text-xs text-white/80">Chats</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 md:p-3 text-center flex flex-col items-center justify-center">
              <Star className="h-5 w-5 md:h-6 md:w-6 fill-yellow-400 text-yellow-400" />
              <div className="text-xs text-white/80 mt-1">Active</div>
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
                <style>{animationStyles}</style>
                <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-muted/10 rounded-lg border-2 shadow-xl">
                  <ScrollArea className="flex-1 p-4 md:p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                      {messages.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                              <Sparkles className="h-12 w-12 text-white" />
                            </div>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-purple-500/20 blur-xl" />
                          </div>
                          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Hi! I'm your AI Learning Assistant 👋
                          </h3>
                          <p className="text-muted-foreground max-w-md mx-auto text-lg mb-6">
                            Ask me anything about programming, data science, mathematics, or any learning topic!
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                            {["Explain Python classes", "Help with calculus", "Data structures tutorial", "Study tips"].map((suggestion) => (
                              <button
                                key={suggestion}
                                onClick={() => setInput(suggestion)}
                                className="px-4 py-2 text-sm bg-muted hover:bg-primary hover:text-white rounded-full border-2 transition-all hover:scale-105"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            style={{
                              animation: "fadeInUp 0.5s ease-out",
                              animationDelay: `${index * 0.1}s`,
                              animationFillMode: "backwards"
                            }}
                          >
                            {/* Avatar for Assistant */}
                            {message.role === "assistant" && (
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <Bot className="h-5 w-5 text-white" />
                              </div>
                            )}
                            
                            {/* Message Content */}
                            <div className={`flex flex-col max-w-[80%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                              <div
                                className={`group relative rounded-2xl px-5 py-4 shadow-md transition-all hover:shadow-lg ${
                                  message.role === "user"
                                    ? "bg-gradient-to-br from-primary to-purple-600 text-white"
                                    : "bg-white dark:bg-gray-800 border-2"
                                }`}
                              >
                                {/* Streaming indicator */}
                                {message.isStreaming && (
                                  <div className="absolute -top-8 left-0 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>AI is typing...</span>
                                  </div>
                                )}
                                
                                <div className={`prose prose-sm max-w-none ${
                                  message.role === "user" 
                                    ? "prose-invert" 
                                    : "dark:prose-invert"
                                }`}>
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {message.content || "..."}
                                  </ReactMarkdown>
                                </div>
                                
                                {/* Action Buttons */}
                                {message.role === "assistant" && message.content && !message.isStreaming && (
                                  <div className="flex gap-1 mt-3 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2 text-xs"
                                      onClick={() => {
                                        navigator.clipboard.writeText(message.content);
                                        toast.success("Copied to clipboard!");
                                        const updatedMessages = [...messages];
                                        updatedMessages[index].reactions = { ...updatedMessages[index].reactions, copied: true };
                                        setMessages(updatedMessages);
                                        setTimeout(() => {
                                          updatedMessages[index].reactions = { ...updatedMessages[index].reactions, copied: false };
                                          setMessages([...updatedMessages]);
                                        }, 2000);
                                      }}
                                    >
                                      {message.reactions?.copied ? (
                                        <Check className="h-3 w-3 mr-1" />
                                      ) : (
                                        <Copy className="h-3 w-3 mr-1" />
                                      )}
                                      Copy
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className={`h-7 px-2 text-xs ${message.reactions?.liked ? 'text-green-600' : ''}`}
                                      onClick={() => {
                                        const updatedMessages = [...messages];
                                        updatedMessages[index].reactions = {
                                          ...updatedMessages[index].reactions,
                                          liked: !updatedMessages[index].reactions?.liked
                                        };
                                        setMessages(updatedMessages);
                                        toast.success(updatedMessages[index].reactions?.liked ? "👍 Helpful!" : "Feedback removed");
                                      }}
                                    >
                                      <ThumbsUp className="h-3 w-3 mr-1" />
                                      {message.reactions?.liked ? "Helpful!" : "Like"}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2 text-xs"
                                      onClick={() => {
                                        setInput("Can you explain that differently?");
                                      }}
                                    >
                                      <RotateCcw className="h-3 w-3 mr-1" />
                                      Retry
                                    </Button>
                                  </div>
                                )}
                              </div>
                              
                              {/* Timestamp */}
                              <span className="text-xs text-muted-foreground mt-1 px-2">
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            
                            {/* Avatar for User */}
                            {message.role === "user" && (
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                <User className="h-5 w-5 text-white" />
                              </div>
                            )}
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="border-t-2 bg-background/80 backdrop-blur p-4">
                    <div className="max-w-4xl mx-auto">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1 relative">
                          <Textarea
                            placeholder="Ask me anything... (Press Enter to send, Shift+Enter for new line)"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                              }
                            }}
                            disabled={isLoading}
                            className="min-h-[60px] max-h-[200px] resize-none pr-12 text-base"
                            rows={2}
                          />
                          <div className="absolute bottom-3 right-3 flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                const emojis = ["😊", "🤔", "👍", "💡", "🎯", "🚀"];
                                setInput(input + emojis[Math.floor(Math.random() * emojis.length)]);
                              }}
                            >
                              <Smile className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button 
                          onClick={handleSend} 
                          disabled={isLoading || !input.trim()}
                          size="lg"
                          className="h-[60px] w-[60px] rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        >
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex gap-2 mt-3 text-xs text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        <span>AI-powered • Real-time responses • Markdown supported</span>
                      </div>
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
