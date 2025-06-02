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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Modern Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/95 backdrop-blur-xl border-b border-gray-100/50 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0] 
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                repeatDelay: 2,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
              />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                AI Teacher
              </h1>
              <p className="text-sm text-gray-500 font-medium">Online • Ready to help</p>
            </div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <span className="text-gray-600 text-lg">⋮</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-32">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "user" ? (
                // User message - right side
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="max-w-[80%] flex flex-col items-end"
                >
                  <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white rounded-3xl rounded-br-lg px-6 py-4 shadow-lg shadow-blue-500/20">
                    <p className="text-[15px] leading-relaxed font-medium whitespace-pre-line">
                      {message.text}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 mr-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ) : (
                // AI message - left side
                <motion.div
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  className="max-w-[85%] flex items-start space-x-3"
                >
                  <motion.div
                    animate={{ 
                      scale: index === messages.length - 1 && message.sender === "ai" ? [1, 1.1, 1] : 1 
                    }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0 mt-1"
                  >
                    <Bot className="w-4 h-4 text-white" />
                  </motion.div>
                  
                  <div className="flex flex-col">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="relative bg-white rounded-3xl rounded-bl-lg px-6 py-4 shadow-md shadow-gray-200/60 border border-gray-100/80"
                    >
                      <p className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-line font-medium">
                        {message.text}
                      </p>
                      
                      {/* Subtle gradient accent */}
                      <div className="absolute inset-0 rounded-3xl rounded-bl-lg bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 pointer-events-none" />
                    </motion.div>
                    <span className="text-xs text-gray-400 mt-1 ml-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Loading indicator */}
        {sendMessageMutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
              
              <div className="flex flex-col">
                <div className="relative bg-white rounded-3xl rounded-bl-lg px-6 py-4 shadow-md shadow-gray-200/60 border border-gray-100/80">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-4 h-4 text-blue-500" />
                    </motion.div>
                    <span className="text-[15px] text-gray-600 font-medium">AI is thinking...</span>
                  </div>
                  
                  {/* Typing dots animation */}
                  <div className="flex space-x-1 mt-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ 
                          duration: 0.8, 
                          repeat: Infinity, 
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                      />
                    ))}
                  </div>
                  
                  <div className="absolute inset-0 rounded-3xl rounded-bl-lg bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Modern Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100/50 z-40"
      >
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3 max-w-2xl mx-auto">
            {/* Attachment Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors group"
            >
              <Paperclip className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            </motion.button>

            {/* Input Container */}
            <div className="flex-1 relative">
              <motion.div
                whileFocus={{ scale: 1.02 }}
                className="relative bg-gray-50 border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message AI Teacher..."
                  className="w-full border-none bg-transparent focus:ring-0 focus:outline-none px-5 py-3 text-[15px] placeholder:text-gray-400 font-medium"
                  disabled={sendMessageMutation.isPending || isRecording}
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-50/20 via-transparent to-purple-50/20 pointer-events-none" />
              </motion.div>
            </div>

            {/* Send/Voice Button */}
            <AnimatePresence mode="wait">
              {inputMessage.trim() ? (
                <motion.button
                  key="send"
                  initial={{ scale: 0.8, opacity: 0, rotate: -90 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.8, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                >
                  <Send className="w-5 h-5 text-white" />
                </motion.button>
              ) : (
                <motion.button
                  key="voice"
                  initial={{ scale: 0.8, opacity: 0, rotate: 90 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.8, opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleRecording}
                  className={`w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-200 ${
                    isRecording 
                      ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/25 animate-pulse' 
                      : 'bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/25'
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-5 h-5 text-white" />
                  ) : (
                    <Mic className="w-5 h-5 text-white" />
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Recording indicator */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="mt-3 flex items-center justify-center space-x-3"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                />
                <span className="text-sm font-medium text-red-600">Recording voice message...</span>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <BottomNavigation currentPage="ai-teacher" />
    </div>
  );
}