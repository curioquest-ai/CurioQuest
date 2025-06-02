import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Lightbulb, Edit3, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";

export default function AITeacher() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentLesson, setCurrentLesson] = useState("Quadratic Equations");
  const [aiResponse, setAiResponse] = useState("Great! Now let's work through this step by step. Can you tell me what you think the first step should be when we see: x² + 5x - 6 = 0?");
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulated voice recognition
  const startListening = () => {
    setIsListening(true);
    setIsProcessing(false);
    
    // Simulate listening process
    setTimeout(() => {
      setIsListening(false);
      setIsProcessing(true);
      
      // Simulate AI processing and response
      setTimeout(() => {
        setIsProcessing(false);
        setAiResponse("Excellent thinking! Yes, factoring is often the first approach. Let's factor x² + 5x - 6. What two numbers multiply to -6 and add to 5?");
      }, 2000);
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
    setIsProcessing(false);
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>

          {/* Progress Bar */}
          <div className="flex-1 mx-4 sm:mx-6">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "75%" }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

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
      <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6 pt-20 pb-32">
        {/* Listening Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <h2 className="text-white text-xl sm:text-2xl font-medium text-center mb-4">
            {isListening ? "Listening..." : isProcessing ? "Processing..." : "Ready to help"}
          </h2>
        </motion.div>

        {/* Animated Listening Circle */}
        <motion.div
          className="relative mb-8 sm:mb-12"
          animate={isListening ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-48 h-48 sm:w-64 sm:h-64 relative">
            {/* Outer ring with gradient */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd, #ff6b6b)"
              }}
              animate={isListening ? { rotate: 360 } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner circle */}
            <div className="absolute inset-4 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
              <div className="text-4xl sm:text-5xl">🎓</div>
            </div>
            
            {/* Pulse effect when listening */}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-white/30"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>

        {/* AI Response Card */}
        <AnimatePresence>
          {aiResponse && !isListening && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              className="w-full max-w-2xl mx-auto mb-8 sm:mb-12"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center">
                  {currentLesson}
                </h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed text-center">
                  {aiResponse}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-6 sm:space-x-8">
          {/* Refresh/Reset Button */}
          <div className="text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 mb-2"
              >
                <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8" />
              </Button>
            </motion.div>
            <p className="text-white text-xs sm:text-sm opacity-80">
              Say "I need help" anytime
            </p>
          </div>

          {/* Main Voice Button */}
          <div className="text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white/30 mb-2 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : isProcessing
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-white/10 hover:bg-white/20'
                } backdrop-blur-sm text-white transition-all duration-200`}
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Lightbulb className="w-8 h-8 sm:w-10 sm:h-10" />
                  </motion.div>
                ) : (
                  <Edit3 className="w-8 h-8 sm:w-10 sm:h-10" />
                )}
              </Button>
            </motion.div>
            <p className="text-white text-xs sm:text-sm opacity-80">
              {isListening ? "Tap to interrupt" : isProcessing ? "Thinking..." : "Tap to speak"}
            </p>
          </div>

          {/* Hint Button */}
          <div className="text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 mb-2"
              >
                <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8" />
              </Button>
            </motion.div>
            <p className="text-white text-xs sm:text-sm opacity-80">
              Get a hint
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage="ai-teacher" />
    </div>
  );
}