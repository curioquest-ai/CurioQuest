/// <reference path="../types/elevenlabs.d.ts" />
import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BottomNavigation from "@/components/bottom-navigation";

export default function AITeacher() {
  const [showTranscript, setShowTranscript] = useState(false);
  const [showVisualContent, setShowVisualContent] = useState(true);

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
        {/* ElevenLabs Conversational AI Interface */}
        <div className="w-full max-w-4xl mx-auto relative z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ height: '600px' }}
          >
            <iframe
              src="https://elevenlabs.io/app/talk-to?agent_id=agent_01jwrh5g9pergrk651t512kmjg"
              width="100%"
              height="100%"
              style={{
                border: 'none',
                borderRadius: '16px'
              }}
              allow="microphone; camera; autoplay"
              title="AI Teacher - Ms. Priya Sharma"
            />
          </motion.div>
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
            Your AI teaching assistant is ready to help with any subject. 
            She maintains context throughout your learning session.
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