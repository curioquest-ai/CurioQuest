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
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 shadow-lg"
      >
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Bot className="w-4 h-4" />
          </motion.div>
          <div>
            <h1 className="text-base font-semibold">AI Teacher</h1>
            <p className="text-xs opacity-90">Your personalized learning assistant</p>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 pb-32">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-start space-x-2 max-w-[85%] ${
                message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === "user" 
                    ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" 
                    : "bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
                }`}>
                  {message.sender === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                </div>
                
                <div className={`rounded-2xl px-3 py-2 shadow-sm ${
                  message.sender === "user" 
                    ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" 
                    : "bg-white border border-gray-100"
                }`}>
                  <p className={`text-sm leading-relaxed whitespace-pre-line ${
                    message.sender === "user" ? "text-white" : "text-gray-800"
                  }`}>{message.text}</p>
                  <p className={`text-xs mt-1 opacity-60 ${
                    message.sender === "user" ? "text-white/70" : "text-gray-500"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Loading indicator */}
        {sendMessageMutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl px-3 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                  <span className="text-xs text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp-style Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-16 left-0 right-0 px-3 py-2 bg-white border-t border-gray-100 z-40"
      >
        <div className="flex items-end space-x-2 max-w-md mx-auto">
          {/* Attachment Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600 w-8 h-8 mb-0.5"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          {/* Input Container */}
          <div className="flex-1 relative">
            <div className="flex items-center bg-gray-50 rounded-full px-3 py-2 min-h-[36px] border border-gray-200">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 border-none bg-transparent focus:ring-0 focus:outline-none p-0 text-sm placeholder:text-gray-400"
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
                className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-sm"
              >
                <Send className="w-3 h-3" />
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
                className={`w-8 h-8 rounded-full shadow-sm transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-3 h-3 text-white" />
                ) : (
                  <Mic className="w-3 h-3 text-white" />
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
                className="w-1.5 h-1.5 bg-red-500 rounded-full"
              />
              <span className="text-xs font-medium">Recording...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <BottomNavigation currentPage="ai-teacher" />
    </div>
  );
}