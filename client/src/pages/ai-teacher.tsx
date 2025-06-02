import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Mic, MicOff, Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import BottomNavigation from "@/components/bottom-navigation";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function AITeacher() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate personalized welcome message on component mount
  useEffect(() => {
    if (user) {
      const welcomeMessage = {
        id: "welcome",
        text: `Hello ${user.name}! 🎓 I'm your personal AI teacher here to help you excel in your studies!

I can see you're in grade ${user.grade} at ${user.school}. I'm here to:
• Explain concepts from your watched videos
• Help with homework and assignments  
• Answer questions about your subjects
• Give personalized study tips based on your progress
• Celebrate your achievements and guide your learning journey

What would you like to explore today? Feel free to ask me anything!`,
        sender: "ai" as const,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai-teacher/chat", { 
        message,
        userId: user?.id 
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + "_ai",
        text: data.response,
        sender: "ai",
        timestamp: new Date(),
      }]);
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // For now, we'll convert to text placeholder
        const userMessage: Message = {
          id: Date.now().toString(),
          text: "🎤 Voice message: (Voice-to-text coming soon!)",
          sender: "user",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg"
      >
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Bot className="w-6 h-6" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold">AI Teacher</h1>
            <p className="text-sm opacity-90">Your personalized learning assistant</p>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${
                message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === "user" 
                    ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" 
                    : "bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
                }`}>
                  {message.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <Card className={`${
                  message.sender === "user" 
                    ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" 
                    : "bg-white shadow-md"
                }`}>
                  <CardContent className="p-3">
                    <p className={`text-sm leading-relaxed whitespace-pre-line ${
                      message.sender === "user" ? "text-white" : "text-gray-800"
                    }`}>{message.text}</p>
                    <p className={`text-xs mt-1 opacity-70 ${
                      message.sender === "user" ? "text-white/70" : "text-muted-foreground"
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Loading indicator */}
        {sendMessageMutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="bg-white shadow-md">
                <CardContent className="p-3 flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp-style Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-white border-t border-gray-200"
      >
        <div className="flex items-end space-x-2">
          {/* Attachment Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 mb-1"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          {/* Input Container */}
          <div className="flex-1 relative">
            <div className="flex items-end bg-gray-100 rounded-3xl px-4 py-2 min-h-[44px]">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your learning..."
                className="flex-1 border-none bg-transparent focus:ring-0 focus:outline-none p-0 text-sm resize-none"
                disabled={sendMessageMutation.isPending || isRecording}
              />
            </div>
          </div>

          {/* Send/Voice Button */}
          {inputMessage.trim() ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending}
                size="icon"
                className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
              >
                <Send className="w-5 h-5" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={toggleRecording}
                size="icon"
                className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-white" />
                )}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-2 flex items-center justify-center space-x-2 text-red-500"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 bg-red-500 rounded-full"
              />
              <span className="text-sm font-medium">Recording voice message...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <BottomNavigation currentPage="ai-teacher" />
    </div>
  );
}