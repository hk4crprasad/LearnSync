import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, Loader2, Radio } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface VoiceMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const VoiceChat = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentStatus, setCurrentStatus] = useState("Disconnected");

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = async () => {
    try {
      setIsConnecting(true);
      setCurrentStatus("Requesting microphone access...");

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      mediaStreamRef.current = stream;

      // Create audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });

      setCurrentStatus("Connecting to AI voice assistant...");

      // Connect to WebSocket
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/voice/realtime`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setCurrentStatus("Connected - Start speaking!");
        toast.success("Voice assistant connected!");
        addMessage("assistant", "Hello! I'm your AI learning assistant. How can I help you with your studies today?");
        
        // Start sending audio
        startAudioStream(ws, stream);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast.error("Connection error occurred");
        setCurrentStatus("Connection error");
      };

      ws.onclose = () => {
        setIsConnected(false);
        setCurrentStatus("Disconnected");
        toast.info("Voice assistant disconnected");
      };

    } catch (error: any) {
      console.error("Connection error:", error);
      toast.error(error.message || "Failed to connect to voice assistant");
      setIsConnecting(false);
      setCurrentStatus("Connection failed");
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsConnected(false);
    setCurrentStatus("Disconnected");
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  };

  const startAudioStream = (ws: WebSocket, stream: MediaStream) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
      if (!isMuted && ws.readyState === WebSocket.OPEN) {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert float32 to int16
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Convert to base64
        const base64Audio = btoa(
          String.fromCharCode.apply(null, Array.from(new Uint8Array(int16Data.buffer)))
        );

        // Send to server
        ws.send(JSON.stringify({
          type: "input_audio",
          audio: base64Audio
        }));
      }
    };
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case "session.created":
      case "session.updated":
        console.log("Session initialized:", data);
        break;

      case "conversation.item.created":
        if (data.item?.type === "message") {
          const role = data.item.role;
          const content = data.item.content?.[0]?.transcript || "";
          if (content && role) {
            addMessage(role, content);
          }
        }
        break;

      case "response.audio.delta":
        // Queue audio for playback
        if (data.delta && isSpeakerOn) {
          try {
            const audioData = atob(data.delta);
            const uint8Array = new Uint8Array(audioData.length);
            for (let i = 0; i < audioData.length; i++) {
              uint8Array[i] = audioData.charCodeAt(i);
            }
            const int16Array = new Int16Array(uint8Array.buffer);
            audioQueueRef.current.push(int16Array);
            
            if (!isPlayingRef.current) {
              playAudioQueue();
            }
          } catch (error) {
            console.error("Error processing audio:", error);
          }
        }
        break;

      case "response.audio_transcript.delta":
        // Update transcript in real-time
        console.log("Transcript delta:", data.delta);
        break;

      case "response.audio_transcript.done":
        const transcript = data.transcript;
        if (transcript) {
          addMessage("assistant", transcript);
        }
        break;

      case "input_audio_buffer.speech_started":
        setCurrentStatus("Listening...");
        break;

      case "input_audio_buffer.speech_stopped":
        setCurrentStatus("Processing...");
        break;

      case "response.done":
        setCurrentStatus("Connected - Start speaking!");
        break;

      case "error":
        console.error("OpenAI error:", data.error);
        toast.error(data.error?.message || "An error occurred");
        break;
    }
  };

  const playAudioQueue = async () => {
    if (!audioContextRef.current || isPlayingRef.current) return;
    
    isPlayingRef.current = true;

    while (audioQueueRef.current.length > 0) {
      const audioData = audioQueueRef.current.shift();
      if (!audioData) continue;

      try {
        // Convert int16 to float32
        const float32Data = new Float32Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          float32Data[i] = audioData[i] / (audioData[i] < 0 ? 0x8000 : 0x7FFF);
        }

        // Create audio buffer
        const audioBuffer = audioContextRef.current.createBuffer(
          1,
          float32Data.length,
          24000
        );
        audioBuffer.getChannelData(0).set(float32Data);

        // Play audio
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        await new Promise<void>((resolve) => {
          source.onended = () => resolve();
          source.start();
        });
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    }

    isPlayingRef.current = false;
  };

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? "Microphone enabled" : "Microphone muted");
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toast.info(isSpeakerOn ? "Speaker muted" : "Speaker enabled");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Radio className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Voice Assistant</h1>
              <p className="text-white/90">Talk to your AI learning companion</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Voice Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Voice Controls</CardTitle>
              <CardDescription>
                Connect and talk with your AI assistant using voice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              <div className="text-center p-6 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isConnected && (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  )}
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {currentStatus}
                  </Badge>
                </div>
                {isConnected && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Speak naturally - I'm listening and ready to help!
                  </p>
                )}
              </div>

              {/* Main Controls */}
              <div className="space-y-4">
                {!isConnected ? (
                  <Button
                    onClick={connect}
                    disabled={isConnecting}
                    className="w-full h-16 text-lg"
                    size="lg"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Phone className="h-6 w-6 mr-2" />
                        Start Voice Chat
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={disconnect}
                    variant="destructive"
                    className="w-full h-16 text-lg"
                    size="lg"
                  >
                    <PhoneOff className="h-6 w-6 mr-2" />
                    End Voice Chat
                  </Button>
                )}

                {/* Mute/Speaker Controls */}
                {isConnected && (
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={toggleMute}
                      variant={isMuted ? "destructive" : "outline"}
                      className="h-12"
                    >
                      {isMuted ? (
                        <>
                          <MicOff className="h-5 w-5 mr-2" />
                          Unmute
                        </>
                      ) : (
                        <>
                          <Mic className="h-5 w-5 mr-2" />
                          Mute
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={toggleSpeaker}
                      variant={!isSpeakerOn ? "destructive" : "outline"}
                      className="h-12"
                    >
                      {!isSpeakerOn ? (
                        <>
                          <VolumeX className="h-5 w-5 mr-2" />
                          Speaker Off
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-5 w-5 mr-2" />
                          Speaker On
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <h4 className="font-semibold text-sm mb-2">How to use:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Click "Start Voice Chat" to connect</li>
                    <li>• Allow microphone access when prompted</li>
                    <li>• Speak naturally - the AI will respond with voice</li>
                    <li>• Ask questions about your studies, homework, or concepts</li>
                    <li>• Use mute/speaker buttons to control audio</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Conversation Transcript */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>
                Live transcript of your voice conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Start a voice chat to see the conversation here</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">
                            {msg.role === "user" ? "You" : "AI Assistant"}
                          </span>
                          <span className="text-xs opacity-70">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accessibility Notice */}
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                <Radio className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Accessibility Feature</h3>
                <p className="text-sm text-green-800">
                  This voice assistant is designed for accessibility, enabling visually impaired students
                  to interact with the learning platform using natural voice conversations. The AI can help
                  explain concepts, answer questions, and guide you through your studies entirely through voice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceChat;
