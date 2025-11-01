import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Plus, 
  MessageSquare, 
  Smile,
  Zap,
  BookOpen,
  Brain,
  Lightbulb,
  Trash2,
  Bot,
  User,
  Calendar,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messageCount: number;
  lastUpdate: Date;
  preview: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI Learning Assistant 👋\n\nAsk me anything about programming, data science, mathematics, or any learning topic!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [activeChat, setActiveChat] = useState("1");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Python Programming Help",
      messageCount: 12,
      lastUpdate: new Date(Date.now() - 3600000),
      preview: "Can you explain classes in Python?",
    },
    {
      id: "2",
      title: "Data Structures Tutorial",
      messageCount: 8,
      lastUpdate: new Date(Date.now() - 7200000),
      preview: "What are linked lists?",
    },
    {
      id: "3",
      title: "Calculus Study Session",
      messageCount: 15,
      lastUpdate: new Date(Date.now() - 86400000),
      preview: "Help with derivatives",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "This is a simulated AI response. In production, this would connect to your AI backend.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    const newSession: ChatSession = {
      id: newChatId,
      title: "New Chat",
      messageCount: 0,
      lastUpdate: new Date(),
      preview: "Start a new conversation",
    };
    setChatSessions([newSession, ...chatSessions]);
    setActiveChat(newChatId);
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Hi! I'm your AI Learning Assistant 👋\n\nAsk me anything about programming, data science, mathematics, or any learning topic!",
        timestamp: new Date(),
      },
    ]);
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatSessions(chatSessions.filter((chat) => chat.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(chatSessions[0]?.id || "");
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-background border-t">
      {/* Left Sidebar - Chat History */}
      <aside className="hidden md:flex flex-col w-[280px] border-r bg-muted/30">
        {/* New Chat Button */}
        <div className="p-4 border-b">
          <Button
            onClick={handleNewChat}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat Sessions List */}
        <ScrollArea className="flex-1 px-2 py-4">
          <div className="space-y-1">
            {chatSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setActiveChat(session.id)}
                className={`group relative rounded-lg p-3 cursor-pointer transition-all hover:bg-accent/50 ${
                  activeChat === session.id
                    ? "bg-accent shadow-sm border border-accent-foreground/10"
                    : "hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1 line-clamp-1">
                      {session.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {session.preview}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        <span>{session.messageCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatTime(session.lastUpdate)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteChat(session.id, e)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            {chatSessions.length}{" "}
            {chatSessions.length === 1 ? "conversation" : "conversations"}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Tab Bar */}
        <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
              <TabsList className="grid w-full max-w-2xl grid-cols-4 h-14">
                <TabsTrigger
                  value="chat"
                  className="text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="learning-path"
                  className="text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Learning Path
                </TabsTrigger>
                <TabsTrigger
                  value="feedback"
                  className="text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Feedback
                </TabsTrigger>
                <TabsTrigger
                  value="explain"
                  className="text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Explain
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Chat Content */}
          <TabsContent
            value="chat"
            className="flex-1 flex flex-col mt-0 overflow-hidden min-h-0"
          >
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-gradient-to-b from-background to-muted/10">
              <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      } animate-in fade-in slide-in-from-bottom-4 duration-500`}
                    >
                      {/* Avatar for Assistant */}
                      {message.role === "assistant" && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      )}

                      {/* Message Content */}
                      <div
                        className={`flex flex-col max-w-[75%] ${
                          message.role === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-5 py-4 shadow-md transition-all hover:shadow-lg ${
                            message.role === "user"
                              ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                              : "bg-white dark:bg-gray-800 border-2 border-border"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>

                        {/* Timestamp */}
                        <span className="text-xs text-muted-foreground mt-1 px-2">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Avatar for User */}
                      {message.role === "user" && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            {/* Input Area - Fixed at Bottom */}
            <div className="border-t-2 bg-background/95 backdrop-blur p-4 flex-shrink-0">
              <div className="container mx-auto max-w-4xl">
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
                      className="min-h-[60px] max-h-[200px] resize-none pr-12 text-base rounded-xl border-2 focus:border-blue-500 transition-colors"
                      rows={2}
                    />
                    <div className="absolute bottom-3 right-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-accent"
                        onClick={() => {
                          const emojis = ["😊", "🤔", "👍", "💡", "🎯", "🚀"];
                          setInput(
                            input + emojis[Math.floor(Math.random() * emojis.length)]
                          );
                        }}
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    size="lg"
                    className="h-[60px] w-[60px] rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>

                {/* Footer Text */}
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span>AI-powered • Real-time responses • Markdown supported</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Other Tabs Content */}
          <TabsContent value="learning-path" className="flex-1 p-6">
            <div className="container mx-auto max-w-4xl">
              <div className="bg-white dark:bg-gray-800 rounded-xl border-2 p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-2">
                  Personalized Learning Path
                </h3>
                <p className="text-muted-foreground">
                  Get a customized learning path based on your preferences
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="flex-1 p-6">
            <div className="container mx-auto max-w-4xl">
              <div className="bg-white dark:bg-gray-800 rounded-xl border-2 p-8 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="text-xl font-semibold mb-2">Answer Feedback</h3>
                <p className="text-muted-foreground">
                  Get detailed feedback on your answers
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="explain" className="flex-1 p-6">
            <div className="container mx-auto max-w-4xl">
              <div className="bg-white dark:bg-gray-800 rounded-xl border-2 p-8 text-center">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                <h3 className="text-xl font-semibold mb-2">Concept Explanation</h3>
                <p className="text-muted-foreground">
                  Get detailed explanations of any concept
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ChatInterface;
