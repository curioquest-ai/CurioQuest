/// <reference path="../types/speech.d.ts" />
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Lightbulb, Mic, Volume2, Repeat, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BottomNavigation from "@/components/bottom-navigation";

type AIState = "idle" | "listening" | "processing" | "speaking";

export default function AITeacher() {
  const [aiState, setAiState] = useState<AIState>("idle");
  const [transcript, setTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [teacherGender, setTeacherGender] = useState<"male" | "female">("female");
  const [aiResponse, setAiResponse] = useState("");
  const [userInput, setUserInput] = useState("");
  const [showVisualContent, setShowVisualContent] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && speechSynthesis) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      synthesisRef.current = speechSynthesis;
      
      // Configure speech recognition
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        setAiState("listening");
      };
      
      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setUserInput(speechResult);
        setTranscript(speechResult);
        setIsListening(false);
        handleUserSpeech(speechResult);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setAiState("idle");
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Handle user speech input
  const handleUserSpeech = async (speechText: string) => {
    setAiState("processing");
    
    // Add user message to conversation history
    const newConversationHistory = [...conversationHistory, { role: 'user' as const, content: speechText }];
    setConversationHistory(newConversationHistory);
    
    try {
      // Call OpenAI API for response with conversation context
      const response = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: speechText,
          teacherGender,
          conversationHistory: newConversationHistory,
          isWakeWord: false
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      // Add AI response to conversation history
      const updatedHistory = [...newConversationHistory, { role: 'assistant' as const, content: data.response }];
      setConversationHistory(updatedHistory);
      
      setAiResponse(data.response);
      speakResponse(data.response);
    } catch (error) {
      console.error('Error processing speech:', error);
      
      // Fallback response when OpenAI is not available
      const fallbackResponses = [
        "That's a great question! Can you tell me more about what you're thinking?",
        "I understand you're working on this. What part would you like to explore further?",
        "Let's break this down step by step. What do you think the first step should be?",
        "That's an interesting approach. Can you explain your reasoning?",
        "I'm here to help you learn. What specific concept would you like me to explain?"
      ];
      
      const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      // Add fallback response to conversation history
      const updatedHistory = [...newConversationHistory, { role: 'assistant' as const, content: fallbackResponse }];
      setConversationHistory(updatedHistory);
      
      setAiResponse(fallbackResponse);
      speakResponse(fallbackResponse);
    }
  };

  // Text-to-speech function
  const speakResponse = (text: string) => {
    if (synthesisRef.current) {
      setAiState("speaking");
      
      // Cancel any ongoing speech
      synthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = teacherGender === "female" ? 1.1 : 0.9;
      utterance.volume = 1;
      
      // Try to use appropriate voice
      const voices = synthesisRef.current.getVoices();
      const preferredVoice = voices.find(voice => 
        teacherGender === "female" 
          ? voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Karen')
          : voice.name.includes('Male') || voice.name.includes('Alex') || voice.name.includes('Daniel')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onend = () => {
        setAiState("idle");
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setAiState("idle");
      };
      
      synthesisRef.current.speak(utterance);
    }
  };

  // Voice interaction functions
  const startVoiceInteraction = () => {
    if (!speechSupported) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }
    
    if (recognitionRef.current && !isListening) {
      setUserInput("");
      setAiResponse("");
      recognitionRef.current.start();
    }
  };

  const stopVoiceInteraction = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    setIsListening(false);
    setAiState("idle");
  };

  const repeatLastResponse = () => {
    if (aiResponse) {
      speakResponse(aiResponse);
    }
  };

  const getHint = async () => {
    setAiState("processing");
    
    try {
      const response = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: "Can you give me a hint?",
          teacherGender,
          isHintRequest: true
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get hint');
      }
      
      const data = await response.json();
      setUserInput("");
      setAiResponse(data.response);
      speakResponse(data.response);
    } catch (error) {
      console.error('Error getting hint:', error);
      const fallbackHint = "Try breaking down the problem into smaller steps and think about what you already know.";
      setAiResponse(fallbackHint);
      speakResponse(fallbackHint);
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
                >
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl min-w-[160px]"
              >
                <DropdownMenuItem 
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">
                    {showTranscript ? "Hide Transcript" : "Show Transcript"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTeacherGender(teacherGender === "female" ? "male" : "female")}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">
                    Teacher: {teacherGender === "female" ? "Madam" : "Sir"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center h-full px-3 sm:px-6 pt-16 sm:pt-20 pb-24 sm:pb-32">

        {/* Animated AI Avatar */}
        <motion.div
          className="relative mb-4 sm:mb-6 md:mb-8"
          animate={aiState === "listening" ? { scale: [1, 1.1, 1] } : aiState === "speaking" ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 relative">
            {/* Outer ring with gradient - animated based on state */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: aiState === "listening" 
                  ? "conic-gradient(from 0deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd, #ff6b6b)"
                  : aiState === "processing"
                  ? "conic-gradient(from 0deg, #f39c12, #e67e22, #d35400, #f39c12)"
                  : aiState === "speaking"
                  ? "conic-gradient(from 0deg, #2ecc71, #27ae60, #16a085, #2ecc71)"
                  : "linear-gradient(45deg, #667eea, #764ba2)"
              }}
              animate={aiState === "listening" || aiState === "processing" ? { rotate: 360 } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner circle with state-based appearance */}
            <motion.div 
              className="absolute inset-2 sm:inset-4 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center"
              animate={aiState === "speaking" ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="text-2xl sm:text-4xl md:text-5xl">
                {aiState === "listening" ? "👂" : 
                 aiState === "processing" ? "🤔" : 
                 aiState === "speaking" ? "🗣️" : "🎓"}
              </div>
            </motion.div>
            
            {/* Pulse effect when listening */}
            {aiState === "listening" && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-white/30"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            
            {/* Sound waves when speaking */}
            {aiState === "speaking" && (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-green-400/40"
                    animate={{ scale: [1, 1.3 + i * 0.2], opacity: [0.6, 0] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: i * 0.3,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </motion.div>

        {/* Content Display Card */}
        <div className="w-full max-w-sm sm:max-w-lg md:max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 px-2">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl flex flex-col justify-center"
               style={{
                 minHeight: aiState === "idle" && !userInput && !aiResponse ? "80px" : "auto"
               }}>
            {/* Content based on state */}
            {aiState === "idle" && !userInput && !aiResponse && (
              <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed text-center italic">
                Tap the microphone and start speaking
              </p>
            )}
            
            {aiState === "listening" && (
              <p className="text-blue-600 text-xs sm:text-sm md:text-base leading-relaxed text-center italic">
                Listening... speak now
              </p>
            )}
            
            {aiState === "processing" && userInput && (
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-blue-700 text-xs sm:text-sm font-medium">You said:</p>
                  <p className="text-gray-700 text-xs sm:text-sm">{userInput}</p>
                </div>
                <p className="text-yellow-600 text-xs sm:text-sm text-center italic">
                  Processing your response...
                </p>
              </div>
            )}
            
            {/* Display full conversation history */}
            {(aiState === "speaking" || aiState === "idle") && conversationHistory.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {conversationHistory.map((message, index) => (
                  <div 
                    key={index} 
                    className={`rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-blue-50 ml-4' 
                        : 'bg-green-50 mr-4'
                    }`}
                  >
                    <p className={`text-xs sm:text-sm font-medium ${
                      message.role === 'user' ? 'text-blue-700' : 'text-green-700'
                    }`}>
                      {message.role === 'user' ? 'You said:' : 'AI Teacher:'}
                    </p>
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Voice-First Control Interface */}
        <div className="flex items-center justify-center space-x-4 sm:space-x-6 md:space-x-8">
          {/* Repeat Button */}
          <div className="text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={repeatLastResponse}
                disabled={aiState === "processing"}
                variant="ghost"
                size="icon"
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 mb-1 sm:mb-2 disabled:opacity-50"
              >
                <Repeat className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" />
              </Button>
            </motion.div>
            <p className="text-white text-xs opacity-80">
              Repeat
            </p>
          </div>

          {/* Main Voice Button */}
          <div className="text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={aiState === "listening" ? stopVoiceInteraction : startVoiceInteraction}
                disabled={aiState === "processing"}
                className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 border-white/30 mb-1 sm:mb-2 ${
                  aiState === "listening" 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : aiState === "processing"
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-white/10 hover:bg-white/20'
                } backdrop-blur-sm text-white transition-all duration-200 disabled:opacity-50`}
              >
                {aiState === "processing" ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                  </motion.div>
                ) : aiState === "listening" ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <Mic className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                  </motion.div>
                ) : aiState === "speaking" ? (
                  <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                ) : (
                  <Mic className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                )}
              </Button>
            </motion.div>
            <p className="text-white text-xs opacity-80">
              {aiState === "listening" ? "Tap to stop" : 
               aiState === "processing" ? "Processing..." : 
               aiState === "speaking" ? "Speaking..." : "Tap to speak"}
            </p>
          </div>

          {/* Hint Button */}
          <div className="text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={getHint}
                disabled={aiState === "processing"}
                variant="ghost"
                size="icon"
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 mb-1 sm:mb-2 disabled:opacity-50"
              >
                <Lightbulb className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" />
              </Button>
            </motion.div>
            <p className="text-white text-xs opacity-80">
              Get hint
            </p>
          </div>
        </div>



        {/* Transcript Display */}
        {transcript && showTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 sm:mt-4 md:mt-6 px-4 w-full max-w-sm sm:max-w-lg md:max-w-2xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white text-xs"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3 h-3" />
                <span className="font-medium">Transcript</span>
              </div>
              {transcript}
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage="ai-teacher" />
    </div>
  );
}