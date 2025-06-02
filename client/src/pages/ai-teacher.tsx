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
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 sm:p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">AI Teacher</h1>
            <p className="text-white/80 text-sm">Ms. Priya Sharma</p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Settings className="w-6 h-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-sm">
            <DropdownMenuItem onClick={() => setShowTranscript(!showTranscript)}>
              <FileText className="w-4 h-4 mr-2" />
              {showTranscript ? "Hide" : "Show"} Transcript
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowVisualContent(!showVisualContent)}>
              <User className="w-4 h-4 mr-2" />
              {showVisualContent ? "Hide" : "Show"} Learning Tips
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 pb-32 pt-8">
        {/* ElevenLabs AI Teacher Placeholder */}
        <div className="w-full max-w-3xl mx-auto relative z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 min-h-[500px] flex flex-col items-center justify-center"
          >
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Ms. Priya Sharma</h2>
                <p className="text-white/80">Your AI Teacher</p>
              </div>
              
              <div className="space-y-4 text-center">
                <p className="text-white/70 text-sm max-w-md">
                  ElevenLabs integration will be set up here to provide advanced conversational AI with natural voice interactions.
                </p>
                
                <div className="bg-white/5 rounded-lg p-4 max-w-sm mx-auto">
                  <p className="text-white/60 text-xs">
                    Waiting for ElevenLabs API key configuration...
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Visual Content Section */}
        {showVisualContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl mt-6 bg-white/5 backdrop-blur-sm rounded-xl p-6"
          >
            <h3 className="text-white text-lg font-semibold mb-4">Coming Soon: Interactive Learning</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Planned Features</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Natural voice conversations</li>
                  <li>• Real-time explanations</li>
                  <li>• Interactive Q&A sessions</li>
                  <li>• Personalized tutoring</li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">ElevenLabs Integration</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Advanced AI conversations</li>
                  <li>• Natural voice synthesis</li>
                  <li>• Context-aware responses</li>
                  <li>• Adaptive learning pace</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <BottomNavigation currentPage="ai-teacher" />
      </div>
    </div>
  );
}