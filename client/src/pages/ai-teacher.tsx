import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Settings, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BottomNavigation from "@/components/bottom-navigation";
import { useAuthContext } from "@/lib/auth.tsx";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': {
        'agent-id': string;
        'override-agent-config'?: string;
        style?: React.CSSProperties;
        children?: React.ReactNode;
      };
    }
  }
}

export default function AITeacher() {
  const [showTranscript, setShowTranscript] = useState(false);
  const [showVisualContent, setShowVisualContent] = useState(true);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const { user } = useAuthContext();
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load ElevenLabs widget script
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    script.onload = () => {
      setWidgetLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load ElevenLabs widget');
    };
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const agentConfig = {
    prompt: {
      prompt: `You are Ms. Priya Sharma, an experienced Indian female school teacher. The student's name is ${user?.name || 'Student'} and they are in grade ${user?.grade || 'unknown'}. Start by greeting them warmly using their name and asking what subject they'd like help with today. Use an assertive but caring teaching style typical of Indian educators.`
    },
    first_message: `Hello ${user?.name || 'Student'}! Welcome to your learning session. I'm Ms. Priya Sharma, your teacher. ${user?.grade ? `Since you're in grade ${user.grade}, ` : ''}I'm here to help you with any subject you're studying. What would you like to learn about today?`
  };

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
      <div className="absolute inset-0" style={{ top: '80px', bottom: '96px' }}>
        <div className="w-full h-full grid place-items-center">
          {widgetLoaded ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '320px',
                height: '400px'
              }}
            >
              <elevenlabs-convai 
                agent-id="agent_01jwrh5g9pergrk651t512kmjg"
                override-agent-config={JSON.stringify(agentConfig)}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block'
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Connecting to Ms. Priya</h3>
                <p className="text-white/80 text-sm">Preparing your AI teacher...</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="animate-pulse flex justify-center space-x-1">
                  <div className="rounded-full bg-white/60 h-2 w-2"></div>
                  <div className="rounded-full bg-white/60 h-2 w-2 animation-delay-200"></div>
                  <div className="rounded-full bg-white/60 h-2 w-2 animation-delay-400"></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <BottomNavigation currentPage="ai-teacher" />
      </div>
    </div>
  );
}