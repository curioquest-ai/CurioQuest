import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Lightbulb, Mic, Volume2, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";

type AIState = "idle" | "listening" | "processing" | "speaking";

export default function AITeacher() {
  const [aiState, setAiState] = useState<AIState>("idle");
  const [transcript, setTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentLesson, setCurrentLesson] = useState("Quadratic Equations");
  const [aiResponse, setAiResponse] = useState("Great! Now let's work through this step by step. Can you tell me what you think the first step should be when we see: x² + 5x - 6 = 0?");
  const [showVisualContent, setShowVisualContent] = useState(true);
  const [voiceHint, setVoiceHint] = useState("Say 'Help me understand' to get started");

  // Voice interaction functions
  const startVoiceInteraction = () => {
    setAiState("listening");
    setVoiceHint("Listening... speak now");
    
    // Simulate listening process
    setTimeout(() => {
      setAiState("processing");
      setVoiceHint("Processing your response...");
      setTranscript("I think we should factor the equation first.");
      
      // Simulate AI processing and response
      setTimeout(() => {
        setAiState("speaking");
        setVoiceHint("AI is responding");
        setAiResponse("Excellent thinking! Yes, factoring is often the first approach. Let's factor x² + 5x - 6. What two numbers multiply to -6 and add to 5?");
        
        // After speaking, return to idle
        setTimeout(() => {
          setAiState("idle");
          setVoiceHint("Say 'Continue' or ask a question");
        }, 3000);
      }, 2000);
    }, 3000);
  };

  const stopVoiceInteraction = () => {
    setAiState("idle");
    setVoiceHint("Tap the microphone to speak");
  };

  const repeatLastResponse = () => {
    setAiState("speaking");
    setVoiceHint("Repeating response...");
    setTimeout(() => {
      setAiState("idle");
      setVoiceHint("Say 'Continue' or ask a question");
    }, 2000);
  };

  const getHint = () => {
    setAiState("speaking");
    setVoiceHint("Providing hint...");
    setAiResponse("Here's a hint: Look for two numbers that when multiplied give you -6. Try thinking of factor pairs like 1 and -6, or 2 and -3.");
    setTimeout(() => {
      setAiState("idle");
      setVoiceHint("Try solving it now, or ask for more help");
    }, 2500);
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm"
            >
              Transcript
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
            >
              <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center h-full px-3 sm:px-6 pt-16 sm:pt-20 pb-24 sm:pb-32">
        {/* AI State Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <h2 className="text-white text-lg sm:text-xl md:text-2xl font-medium text-center mb-1 sm:mb-2">
            {aiState === "listening" ? "Listening..." : 
             aiState === "processing" ? "Processing..." : 
             aiState === "speaking" ? "AI Teacher" : "Ready to help"}
          </h2>
          <p className="text-white/80 text-xs sm:text-sm md:text-base text-center">
            {voiceHint}
          </p>
        </motion.div>

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

        {/* AI Response Card */}
        <AnimatePresence>
          {showVisualContent && aiResponse && aiState !== "listening" && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              className="w-full max-w-sm sm:max-w-lg md:max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 px-2"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl">
                <h3 className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-4 text-center">
                  {currentLesson}
                </h3>
                <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed text-center">
                  {aiResponse}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Voice Commands Hint */}
        {aiState === "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 sm:mt-4 md:mt-6 text-center px-4"
          >
            <p className="text-white/60 text-xs leading-relaxed">
              Try saying: "Explain this step" • "I don't understand" • "Give me an example"
            </p>
          </motion.div>
        )}

        {/* Transcript Toggle */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 sm:mt-4 md:mt-6 px-4"
          >
            <Button
              onClick={() => setShowTranscript(!showTranscript)}
              variant="ghost"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 text-xs"
            >
              {showTranscript ? "Hide" : "Show"} Transcript
            </Button>
            
            {showTranscript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white text-xs"
              >
                {transcript}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage="ai-teacher" />
    </div>
  );
}