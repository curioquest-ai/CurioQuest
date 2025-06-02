/// <reference path="../types/speech.d.ts" />
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, FileText, User, Mic, Volume2, Repeat, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BottomNavigation from "@/components/bottom-navigation";

type AIState = "idle" | "listening" | "processing" | "speaking";

export default function AITeacher() {
  const [aiState, setAiState] = useState<AIState>("idle");
  const [transcript, setTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [showVisualContent, setShowVisualContent] = useState(true);
  const [aiResponse, setAiResponse] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Check for Web Speech API support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setAiState("listening");
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setUserInput(transcript);
        setTranscript(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setAiState("idle");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (userInput) {
          handleUserSpeech(userInput);
        }
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // Handle user speech input
  const handleUserSpeech = async (speechText: string) => {
    setAiState("processing");
    setUserInput(speechText);
    
    // Add user message to conversation history
    const newConversationHistory = [...conversationHistory, { role: 'user' as const, content: speechText }];
    
    try {
      // Call OpenAI API for response with conversation context
      const response = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: speechText,
          teacherGender: "female",
          conversationHistory: newConversationHistory,
          isWakeWord: false
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      // Add AI response to conversation history and update state
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

  // Text-to-speech function with Indian female voice
  const speakResponse = (text: string) => {
    if (synthesisRef.current) {
      setAiState("speaking");
      
      // Cancel any ongoing speech
      synthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure for assertive Indian school teacher tone
      utterance.rate = 0.85; // Slightly slower for authority and clarity
      utterance.pitch = 1.0; // Neutral pitch for assertiveness
      utterance.volume = 0.95; // Higher volume for authority
      
      // Try to find Indian English or female voices
      const voices = synthesisRef.current.getVoices();
      
      // Look for Indian English FEMALE voices first
      const indianFemaleVoice = voices.find(voice => 
        (voice.lang.includes('en-IN') || 
         voice.name.toLowerCase().includes('indian')) &&
        (voice.name.toLowerCase().includes('female') ||
         voice.name.toLowerCase().includes('woman') ||
         voice.name.toLowerCase().includes('veena') ||
         voice.name.toLowerCase().includes('priya') ||
         voice.name.toLowerCase().includes('kavya'))
      );
      
      // Fallback to any Indian voice
      const indianVoice = voices.find(voice => 
        voice.lang.includes('en-IN') || 
        voice.name.toLowerCase().includes('indian')
      );
      
      // Fallback to quality female voices
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('samantha') || 
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('susan') ||
        voice.name.toLowerCase().includes('helen')
      );
      
      // Prefer Indian female voice, then any female voice, then any Indian voice
      if (indianFemaleVoice) {
        utterance.voice = indianFemaleVoice;
      } else if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else if (indianVoice) {
        utterance.voice = indianVoice;
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
      
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
      
      setIsListening(false);
      setAiState("idle");
    }
  };

  const repeatResponse = () => {
    if (aiResponse) {
      speakResponse(aiResponse);
    }
  };

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
        {/* Voice AI Teacher Interface */}
        <div className="w-full max-w-3xl mx-auto relative z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-h-[500px]"
          >
            {/* Conversation Display */}
            <div className="mb-6 h-64 overflow-y-auto bg-white/5 rounded-lg p-4">
              {conversationHistory.length === 0 && !userInput && !aiResponse && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-white/70 text-sm text-center italic">
                    Tap the microphone to start your conversation with Ms. Priya Sharma
                  </p>
                </div>
              )}
              
              {/* Display conversation history */}
              {conversationHistory.length > 0 && (
                <div className="space-y-3">
                  {conversationHistory.map((message, index) => (
                    <div 
                      key={index} 
                      className={`rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-blue-500/20 ml-4' 
                          : 'bg-green-500/20 mr-4'
                      }`}
                    >
                      <p className={`text-xs font-medium mb-1 ${
                        message.role === 'user' ? 'text-blue-200' : 'text-green-200'
                      }`}>
                        {message.role === 'user' ? 'You:' : 'Ms. Priya:'}
                      </p>
                      <p className="text-white text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Current processing state */}
              {aiState === "processing" && (
                <div className="bg-yellow-500/20 rounded-lg p-3 mr-4">
                  <p className="text-yellow-200 text-xs font-medium mb-1">Ms. Priya:</p>
                  <p className="text-white text-sm italic">Thinking...</p>
                </div>
              )}
            </div>

            {/* Voice Controls */}
            <div className="flex items-center justify-center space-x-4">
              {/* Main Microphone Button */}
              <Button
                onClick={isListening ? stopVoiceInteraction : startVoiceInteraction}
                className={`w-16 h-16 rounded-full ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : aiState === "processing"
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : aiState === "speaking"
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
                disabled={aiState === "processing" || aiState === "speaking"}
              >
                <Mic className="w-8 h-8 text-white" />
              </Button>

              {/* Repeat Response Button */}
              {aiResponse && (
                <Button
                  onClick={repeatResponse}
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                  disabled={aiState === "speaking"}
                >
                  <Repeat className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Status Text */}
            <div className="mt-4 text-center">
              <p className="text-white/80 text-sm">
                {aiState === "listening" && "Listening... speak now"}
                {aiState === "processing" && "Processing your question..."}
                {aiState === "speaking" && "Ms. Priya is responding..."}
                {aiState === "idle" && conversationHistory.length === 0 && "Ready to help with your studies"}
                {aiState === "idle" && conversationHistory.length > 0 && "Ready for your next question"}
              </p>
            </div>
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