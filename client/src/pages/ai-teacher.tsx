/// <reference path="../types/elevenlabs.d.ts" />
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BottomNavigation from "@/components/bottom-navigation";

export default function AITeacher() {
  const [showTranscript, setShowTranscript] = useState(false);
  const [showVisualContent, setShowVisualContent] = useState(true);

  // Load ElevenLabs script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg sm:text-xl">Ms. Priya Sharma</h1>
            <p className="text-white/80 text-xs sm:text-sm">AI Teacher</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setShowTranscript(!showTranscript)}>
              <FileText className="mr-2 h-4 w-4" />
              {showTranscript ? "Hide" : "Show"} Transcript
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowVisualContent(!showVisualContent)}>
              <User className="mr-2 h-4 w-4" />
              {showVisualContent ? "Hide" : "Show"} Teacher
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 pb-32 pt-8">
        {/* Teacher Avatar */}
        {showVisualContent && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-white/20 rounded-full flex items-center justify-center mb-8 backdrop-blur-sm"
          >
            <User className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white" />
          </motion.div>
        )}

        {/* Welcome Message */}
        <div className="text-center mb-8 max-w-2xl">
          <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-4">
            Welcome to AI Teacher
          </h2>
          <p className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed">
            Meet Ms. Priya Sharma, your AI teaching assistant. She's here to help you learn and understand any subject with her assertive yet caring teaching style.
          </p>
        </div>

        {/* ElevenLabs Conversational AI Widget */}
        <div className="w-full max-w-4xl mx-auto">
          <elevenlabs-convai agent-id="agent_01jwrh5g9pergrk651t512kmjg"></elevenlabs-convai>
        </div>

        {/* Transcript Section */}
        {showTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 w-full max-w-2xl bg-white/10 backdrop-blur-sm rounded-lg p-4"
          >
            <h3 className="text-white font-semibold mb-3">Conversation Transcript</h3>
            <div className="text-white/80 text-sm">
              <p className="italic">Conversation transcript will appear here when available...</p>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="mt-8 text-center">
          <p className="text-white/70 text-xs sm:text-sm max-w-md mx-auto">
            Click the microphone button above to start your conversation with Ms. Priya Sharma. 
            She can help with any subject and will maintain context throughout your learning session.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <BottomNavigation currentPage="ai-teacher" />
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}