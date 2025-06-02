import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Settings, FileText, User, Mic, MicOff } from "lucide-react";
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
  const [conversationStarted, setConversationStarted] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const { user } = useAuthContext();
  const widgetRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<any>(null);

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

  useEffect(() => {
    const requestMicrophonePermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission('granted');
      } catch (error) {
        console.error('Microphone permission denied:', error);
        setMicPermission('denied');
      }
    };

    if (widgetLoaded) {
      requestMicrophonePermission();
    }
  }, [widgetLoaded]);

  useEffect(() => {
    const handleWidgetLoad = () => {
      if (micPermission === 'granted' && !conversationStarted) {
        // Add auto-start configuration to widget
        const widget = document.querySelector('elevenlabs-convai');
        if (widget) {
          // Try to trigger the start button automatically
          setTimeout(() => {
            const startButton = widget.shadowRoot?.querySelector('button') || 
                              widget.querySelector('button');
            if (startButton) {
              (startButton as HTMLButtonElement).click();
              setConversationStarted(true);
            }
          }, 1000);
        }
      }
    };

    if (widgetLoaded && micPermission === 'granted') {
      handleWidgetLoad();
    }
  }, [widgetLoaded, micPermission, conversationStarted]);

  const agentConfig = {
    prompt: {
      prompt: `You are Mrs. Asha, an experienced Indian female school teacher. The student's name is ${user?.name || 'Student'} and they are in grade ${user?.grade || 'unknown'}. Start by greeting them warmly using their name and asking what subject they'd like help with today. Use an assertive but caring teaching style typical of Indian educators.`
    },
    first_message: `Hello ${user?.name || "Student"}! Welcome to your learning session. I'm Mrs. Asha, your AI teacher. ${user?.grade ? `Since you're in grade ${user.grade}, ` : ""}I'm here to help you with any subject you're studying. What would you like to learn about today?`
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600">
      {/* Teacher Introduction - Top Half */}
      <div className="absolute top-0 left-0 right-0 h-1/2 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center mb-4">
          <User className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-white text-3xl font-bold mb-2">Mrs. Asha</h1>
        <p className="text-white/80 text-lg mb-4">Your AI Teacher</p>
        <p className="text-white/70 text-sm max-w-md leading-relaxed">
          Hi {user?.name || 'there'}! I'm here to help you with your studies. 
          {user?.grade && ` As a grade ${user.grade} student,`} I can assist you with 
          any subject, answer questions, and guide you through challenging topics.
        </p>
        
        {/* Microphone Status */}
        <div className="mt-4 flex items-center space-x-2">
          {micPermission === 'granted' ? (
            <div className="flex items-center space-x-2 text-green-300">
              <Mic className="w-4 h-4" />
              <span className="text-xs">Microphone ready</span>
            </div>
          ) : micPermission === 'denied' ? (
            <div className="flex items-center space-x-2 text-red-300">
              <MicOff className="w-4 h-4" />
              <span className="text-xs">Microphone access needed</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-yellow-300">
              <Mic className="w-4 h-4" />
              <span className="text-xs">Requesting microphone...</span>
            </div>
          )}
        </div>
      </div>

      {/* Widget - Bottom Half */}
      {widgetLoaded ? (
        <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-center justify-center pb-24">
          <elevenlabs-convai
            agent-id="agent_01jwrh5g9pergrk651t512kmjg"
            override-agent-config={JSON.stringify(agentConfig)}
            style={{
              width: "400px",
              height: "300px",
              display: "block"
            }}
          />
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-center justify-center pb-24">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Connecting to Mrs. Asha</h3>
              <p className="text-white/80 text-xs">Preparing your AI teacher...</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="animate-pulse flex justify-center space-x-1">
                <div className="rounded-full bg-white/60 h-1.5 w-1.5"></div>
                <div className="rounded-full bg-white/60 h-1.5 w-1.5 animation-delay-200"></div>
                <div className="rounded-full bg-white/60 h-1.5 w-1.5 animation-delay-400"></div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <BottomNavigation currentPage="ai-teacher" />
      </div>
    </div>
  );
}