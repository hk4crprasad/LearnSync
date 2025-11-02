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
  Smile,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
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
import { useLocation } from "react-router-dom";

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
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSessionSummary[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitialQuery = useRef(false);

  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  // Text-to-speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState<number | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);

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

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      
      if (SpeechRecognition) {
        try {
          const recognitionInstance = new SpeechRecognition();
          recognitionInstance.continuous = false;
          recognitionInstance.interimResults = false;
          recognitionInstance.lang = 'en-US';
          recognitionInstance.maxAlternatives = 1;

          recognitionInstance.onstart = () => {
            console.log('Speech recognition started');
            setIsRecording(true);
          };

          recognitionInstance.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log('Voice captured:', transcript);
            setInput(transcript);
            toast.success("✅ Voice captured: " + transcript.substring(0, 30) + (transcript.length > 30 ? '...' : ''));
          };

          recognitionInstance.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
            
            if (event.error === 'not-allowed' || event.error === 'permission-denied') {
              toast.error("🎤 Microphone access denied. Please enable microphone permissions.");
            } else if (event.error === 'no-speech') {
              toast.error("No speech detected. Please try again.");
            } else if (event.error === 'network') {
              toast.error("Network error. Please check your connection.");
            } else {
              toast.error("Voice input failed: " + event.error);
            }
          };

          recognitionInstance.onend = () => {
            console.log('Speech recognition ended');
            setIsRecording(false);
          };

          setRecognition(recognitionInstance);
          console.log('Speech recognition initialized successfully');
        } catch (error) {
          console.error('Failed to initialize speech recognition:', error);
        }
      } else {
        console.warn('Speech recognition not supported in this browser');
      }
    }

    // Load available voices for TTS
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('🔊 Available TTS voices:', voices.length);
        console.log('📋 Voice list:', voices.map(v => `${v.name} (${v.lang})`));
        
        // Check for Indian language voices
        const indianVoices = voices.filter(v => v.lang.includes('-IN'));
        console.log(`🇮🇳 Indian language voices found: ${indianVoices.length}`);
        indianVoices.forEach(v => console.log(`  - ${v.name} (${v.lang})`));
        
        if (voices.length === 0) {
          console.warn('⚠️ No voices loaded yet. They may load asynchronously.');
        }
      };

      // Load voices immediately
      loadVoices();

      // Some browsers load voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      // Retry after a delay for browsers that need it
      setTimeout(loadVoices, 1000);
    }
  }, []);

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

  // Handle initial query from Dashboard
  useEffect(() => {
    const state = location.state as { initialQuery?: string };
    if (state?.initialQuery && !hasProcessedInitialQuery.current && !isLoading) {
      hasProcessedInitialQuery.current = true;
      setInput(state.initialQuery);
      // Small delay to ensure UI is ready
      setTimeout(() => {
        handleSendWithQuery(state.initialQuery);
      }, 500);
    }
  }, [location.state]);

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
      // toast.success(t("chat.session_loaded")); // Removed flash message
    } catch (error) {
      toast.error(t("chat.failed_load_session"));
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
      // toast.success(t("chat.session_deleted")); // Removed flash message
    } catch (error) {
      toast.error(t("chat.failed_delete_session"));
      console.error(error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    await handleSendWithQuery(input);
  };

  const handleSendWithQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: queryText,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
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
          message: queryText,
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
      let buffer = "";
      const sentenceDelimiters = /[.!?]\s+|[\n\r]+/;

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
                  buffer += data.chunk;
                  fullResponse += data.chunk;
                  
                  // Check if we have complete sentences/lines to display
                  const parts = buffer.split(sentenceDelimiters);
                  
                  // If we have complete sentences (more than one part), display them
                  if (parts.length > 1) {
                    // Keep the last incomplete part in buffer
                    const incompletePart = parts.pop() || "";
                    const completeText = parts.join(". ") + (parts.length > 0 ? ". " : "");
                    
                    // Update the streaming message with complete sentences
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMsg = newMessages[newMessages.length - 1];
                      if (lastMsg && lastMsg.role === "assistant") {
                        // Show accumulated complete sentences plus current buffer
                        const currentComplete = lastMsg.content || "";
                        lastMsg.content = currentComplete + completeText;
                        lastMsg.isStreaming = !data.done;
                      }
                      return newMessages;
                    });
                    
                    buffer = incompletePart;
                    
                    // Small delay for visual effect (line-by-line appearance)
                    await new Promise(resolve => setTimeout(resolve, 50));
                  }
                }
                
                if (data.done) {
                  // Flush any remaining buffer
                  if (buffer.trim()) {
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMsg = newMessages[newMessages.length - 1];
                      if (lastMsg && lastMsg.role === "assistant") {
                        lastMsg.content = fullResponse;
                        lastMsg.isStreaming = false;
                      }
                      return newMessages;
                    });
                  }
                  
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
      
      // toast.success(t("chat.response_received")); // Removed flash message
    } catch (error: any) {
      toast.error(t("chat.failed_send_message"));
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
      toast.success(t("chat.learning_path_generated"));
    } catch (error) {
      toast.error(t("chat.failed_learning_path"));
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
      toast.success(t("chat.feedback_generated"));
    } catch (error) {
      toast.error(t("chat.failed_get_feedback"));
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
      toast.success(t("chat.concept_explained"));
    } catch (error) {
      toast.error(t("chat.failed_explain"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setIsSidebarOpen(false);
    // toast.success(t("chat.new_chat_started")); // Removed flash message
  };

  // Voice input handler
  const toggleVoiceInput = () => {
    if (!recognition) {
      toast.error("Voice input not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isRecording) {
      try {
        recognition.stop();
        setIsRecording(false);
        toast.info("Voice input stopped");
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsRecording(false);
      }
    } else {
      try {
        // Stop any existing recognition first
        try {
          recognition.stop();
        } catch (e) {
          // Ignore if nothing to stop
        }
        
        // Add a small delay before starting new recognition
        setTimeout(() => {
          try {
            recognition.start();
            setIsRecording(true);
            toast.info("🎤 Listening... Speak now");
          } catch (error: any) {
            console.error('Error starting recognition:', error);
            if (error.message && error.message.includes('already started')) {
              toast.error("Voice input is already active. Please wait and try again.");
            } else {
              toast.error("Could not start voice input. Please check microphone permissions.");
            }
            setIsRecording(false);
          }
        }, 100);
      } catch (error) {
        console.error('Error preparing recognition:', error);
        toast.error("Could not start voice input");
        setIsRecording(false);
      }
    }
  };

  // Text-to-speech handler with improved Odia support
  const speakText = async (text: string, messageIndex: number) => {
    // Stop any ongoing speech
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
      setCurrentWordIndex(-1);
      return;
    }

    // Remove markdown formatting for better speech
    let cleanText = text
      .replace(/[#*`_~[\]()]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    // Detect language from text content
    const detectLanguage = (text: string): string => {
      // Check for Odia script
      if (/[\u0B00-\u0B7F]/.test(text)) return 'or';
      // Check for Devanagari script (Hindi)
      if (/[\u0900-\u097F]/.test(text)) return 'hi';
      // Check for Tamil script
      if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
      // Check for Telugu script
      if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
      // Check for Bengali script
      if (/[\u0980-\u09FF]/.test(text)) return 'bn';
      // Default to current UI language or English
      const langMap: { [key: string]: string } = {
        'en': 'en',
        'hi': 'hi',
        'or': 'or',
        'ta': 'ta',
        'te': 'te',
        'bn': 'bn',
      };
      return langMap[i18n.language] || 'en';
    };

    const detectedLang = detectLanguage(cleanText);
    
    // For Odia text, add pauses for better pronunciation
    if (detectedLang === 'or') {
      // Add pauses after Odia punctuation marks
      cleanText = cleanText.replace(/।/g, '। '); // Add space after Odia danda
      cleanText = cleanText.replace(/\s+/g, '  '); // Double spaces for longer pauses
    }

    setIsSpeaking(true);
    setCurrentSpeakingIndex(messageIndex);
    setCurrentWordIndex(0);

    const langNames: { [key: string]: string } = {
      'en': 'English',
      'hi': 'Hindi (हिन्दी)',
      'or': 'Odia (ଓଡ଼ିଆ)',
      'ta': 'Tamil (தமிழ்)',
      'te': 'Telugu (తెలుగు)',
      'bn': 'Bengali (বাংলা)',
    };

    // Map to browser language codes
    const browserLangMap: { [key: string]: string } = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'or': 'or-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'bn': 'bn-IN',
    };

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = browserLangMap[detectedLang] || 'en-US';
    
    // Optimized settings for each language - FASTER SPEEDS
    if (detectedLang === 'or') {
      // Faster for Odia
      utterance.rate = 0.85;
      utterance.pitch = 0.95;
      utterance.volume = 1.0;
    } else if (detectedLang === 'hi') {
      // Faster for Hindi
      utterance.rate = 0.9;
      utterance.pitch = 0.95;
      utterance.volume = 1.0;
    } else if (detectedLang === 'bn') {
      // Faster for Bengali
      utterance.rate = 0.9;
      utterance.pitch = 0.95;
      utterance.volume = 1.0;
    } else if (detectedLang === 'ta' || detectedLang === 'te') {
      // Tamil and Telugu
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
    } else {
      // English - Normal speed
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
    }

    // Wait for voices to load
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      
      // Find best voice for the language
      let selectedVoice = null;
      
      // Priority 1: Google voices (best quality)
      selectedVoice = voices.find(v => 
        v.lang.startsWith(detectedLang) && 
        (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('india'))
      );
      
      // Priority 2: Any voice matching the language
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang === browserLangMap[detectedLang]);
      }
      
      // Priority 3: Any voice with language code prefix
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith(detectedLang));
      }
      
      // Priority 4: Any Indian language voice
      if (!selectedVoice && browserLangMap[detectedLang]?.includes('-IN')) {
        selectedVoice = voices.find(v => v.lang.includes('IN'));
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`🔊 Selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        console.log(`   Settings: rate=${utterance.rate}, pitch=${utterance.pitch}`);
        // toast.success(`🔊 ${langNames[detectedLang]} - ${selectedVoice.name}`, {
        //   duration: 2000,
        // }); // Removed flash message
      } else {
        console.warn(`⚠️ No ${detectedLang} voice found. Available voices:`);
        voices.forEach(v => console.log(`   - ${v.name} (${v.lang})`));
        // toast.warning(`No ${langNames[detectedLang]} voice installed. Using default voice.`, {
        //   duration: 3000,
        // }); // Removed flash message
      }
    };

    // Load voices
    loadVoices();
    
    // Reload voices if they change (some browsers load asynchronously)
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Split text into words for highlighting
    const words = cleanText.split(/\s+/);
    let wordIndex = 0;

    utterance.onstart = () => {
      console.log(`🎤 Speaking ${detectedLang}: "${cleanText.substring(0, 50)}..."`);
    };

    // Track word boundaries for highlighting
    utterance.onboundary = (event) => {
      if (event.name === 'word' && wordIndex < words.length) {
        setCurrentWordIndex(wordIndex);
        wordIndex++;
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
      setCurrentWordIndex(-1);
      console.log('✅ Speech completed');
    };

    utterance.onerror = (error) => {
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
      setCurrentWordIndex(-1);
      console.error('❌ Speech error:', error);
      toast.error(`Speech failed: ${error.error}`);
    };

    // Small delay to ensure voice is loaded
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  // Component to render text with word highlighting during speech
  const HighlightedText = ({ text, messageIndex }: { text: string; messageIndex: number }) => {
    const isCurrentlySpeaking = isSpeaking && currentSpeakingIndex === messageIndex;
    
    if (!isCurrentlySpeaking) {
      return (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {text || "..."}
        </ReactMarkdown>
      );
    }

    // Clean text for word matching (remove markdown)
    const cleanText = text
      .replace(/[#*`_~[\]()]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    
    const words = cleanText.split(/\s+/);
    
    return (
      <div className="space-y-2">
        {words.map((word, index) => (
          <span
            key={index}
            className={`inline-block mr-1 transition-all duration-200 ${
              index === currentWordIndex
                ? 'bg-yellow-300 dark:bg-yellow-600 text-black font-semibold px-1 rounded scale-110'
                : ''
            }`}
          >
            {word}
          </span>
        ))}
      </div>
    );
  };

  const ChatSidebar = () => (
    <div className="flex flex-col h-full w-full bg-muted/30">
      <div className="p-4 border-b flex-shrink-0">
        <Button onClick={handleNewChat} className="w-full" variant="default">
          <Plus className="h-4 w-4 mr-2" />
          {t("chat.new_chat")}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="space-y-1 px-2 py-4">
          {chatSessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                {t("chat.no_previous_chats")}
              </p>
            </div>
          ) : (
            chatSessions.map((session) => (
              <div
                key={session.session_id}
                className={cn(
                  "group relative rounded-lg p-3 cursor-pointer transition-all bg-white hover:shadow-lg",
                  sessionId === session.session_id && "shadow-md"
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
      
      <div className="p-4 border-t flex-shrink-0">
        <div className="text-xs text-muted-foreground text-center">
          {chatSessions.length} {chatSessions.length === 1 ? t("chat.conversation") : t("chat.conversations")}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Hero Header - Fixed Height */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white relative overflow-hidden flex-shrink-0">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full animate-pulse" />
          <div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white rounded-full animate-pulse delay-700" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 border-4 border-white rounded-full animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 py-6 md:py-8 relative">
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
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-2xl border-2 border-white/30">
                  <Bot className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-lg md:text-2xl font-bold">{t("chat.title")}</h1>
                  <span className="hidden md:inline-block px-2 py-1 text-xs bg-yellow-400 text-yellow-900 rounded-full font-semibold">
                    ⚡ {t("chat.live")}
                  </span>
                </div>
                <p className="text-white/90 text-xs md:text-sm flex items-center gap-2">
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                  {t("chat.streaming_info")}
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
                {t("chat.voice_chat")}
              </Button>
              <Button 
                onClick={handleNewChat} 
                variant="secondary"
                className="gap-2 hover:scale-105 transition-transform"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">{t("chat.new_chat")}</span>
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-3 grid grid-cols-3 gap-2 md:gap-3 max-w-md">
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
              <div className="text-base md:text-xl font-bold">{messages.length}</div>
              <div className="text-xs text-white/80">{t("chat.messages")}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
              <div className="text-base md:text-xl font-bold">{chatSessions.length}</div>
              <div className="text-xs text-white/80">{t("chat.chats")}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center flex flex-col items-center justify-center">
              <Star className="h-4 w-4 md:h-5 md:w-5 fill-yellow-400 text-yellow-400" />
              <div className="text-xs text-white/80 mt-1">Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Flex Layout with Controlled Scrolling */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Chat History (Scrollable) */}
        <aside className="hidden lg:flex w-80 border-r bg-muted/30 flex-col overflow-hidden">
          <ChatSidebar />
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <style>{animationStyles}</style>
          
          {/* Messages Container - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
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
                    {t("chat.hero_greeting")}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto text-lg mb-6">
                    {t("chat.hero_description")}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                    {[
                      "Explain Python classes",
                      "Help with calculus", 
                      "Data structures tutorial",
                      "Study tips for exams"
                    ].map((suggestion) => (
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
                                    <span>{t("chat.ai_typing")}</span>
                                  </div>
                                )}
                                
                                <div className={`prose prose-sm max-w-none ${
                                  message.role === "user" 
                                    ? "prose-invert" 
                                    : "dark:prose-invert"
                                }`}>
                                  {message.role === "assistant" && isSpeaking && currentSpeakingIndex === index ? (
                                    <HighlightedText text={message.content} messageIndex={index} />
                                  ) : (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {message.content || "..."}
                                    </ReactMarkdown>
                                  )}
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
                                        toast.success(t("common.copied_to_clipboard"));
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
                                      {t("common.copy")}
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
                                        toast.success(updatedMessages[index].reactions?.liked ? t("chat.helpful") : t("chat.feedback_removed"));
                                      }}
                                    >
                                      <ThumbsUp className="h-3 w-3 mr-1" />
                                      {message.reactions?.liked ? t("chat.helpful") : t("common.like")}
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
                                      {t("common.retry")}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className={`h-7 px-2 text-xs ${currentSpeakingIndex === index ? 'text-primary' : ''}`}
                                      onClick={() => speakText(message.content, index)}
                                    >
                                      {currentSpeakingIndex === index ? (
                                        <VolumeX className="h-3 w-3 mr-1" />
                                      ) : (
                                        <Volume2 className="h-3 w-3 mr-1" />
                                      )}
                                      {currentSpeakingIndex === index ? "Stop" : "Listen"}
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
                  </div>

                  {/* Input Area - Sticky at Bottom */}
                  <div className="sticky bottom-0 bg-background border-t-2 shadow-lg">
                    <div className="px-4 py-4 max-w-4xl mx-auto">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1 relative">
                          <Textarea
                            placeholder={t("chat.placeholder")}
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
                              className={`h-8 w-8 p-0 ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
                              onClick={toggleVoiceInput}
                              disabled={isLoading}
                              title={isRecording ? "Stop recording" : "Voice input"}
                            >
                              {isRecording ? (
                                <MicOff className="h-4 w-4" />
                              ) : (
                                <Mic className="h-4 w-4" />
                              )}
                            </Button>
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
                </main>
              </div>
            </div>
          );
        };

        export default Chatbot;
