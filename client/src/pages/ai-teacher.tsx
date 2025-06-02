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

  // Load ElevenLabs script and check widget status
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    script.onload = () => {
      console.log('ElevenLabs script loaded successfully');
      // Check if the custom element is defined
      setTimeout(() => {
        if (customElements.get('elevenlabs-convai')) {
          console.log('ElevenLabs custom element is available');
        } else {
          console.error('ElevenLabs custom element not found');
        }
      }, 1000);
    };
    script.onerror = () => {
      console.error('Failed to load ElevenLabs script');
    };
    document.head.appendChild(script);

    return () => {
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
        {/* Voice Assistant Interface */}
        <div className="w-full max-w-2xl mx-auto relative z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
          >
            <div className="mb-6">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-green-600 transition-colors">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Ready to Help</h3>
              <p className="text-white/80 text-sm">
                Tap the microphone to start your conversation
              </p>
            </div>
            
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Start Voice Chat
            </button>
          </motion.div>
        </div>
        
        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm max-w-md mx-auto">
            Your AI teaching assistant is ready to help with any subject. 
            She maintains context throughout your learning session.
          </p>
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
      <div className="absolute bottom-0 left-0 right-0 z-10">
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