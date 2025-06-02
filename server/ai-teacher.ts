import { ElevenLabs } from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabs({
  apiKey: process.env.ELEVENLABS_API_KEY || "sk_b1eada8e6c709f87465a7709edaf8ef5fa59bfa2fb613cd1"
});

interface AITeacherRequest {
  userMessage: string;
  teacherGender: "male" | "female";
  conversationHistory?: Array<{role: 'user' | 'assistant', content: string}>;
  isWakeWord?: boolean;
  isHintRequest?: boolean;
  userName?: string;
  userGrade?: number;
}

export async function initializeElevenLabsConversation(userName: string = "Student", userGrade: number = 1): Promise<any> {
  try {
    const conversation = await elevenlabs.conversationalAi.createConversation({
      agent_id: "agent_01jwrh5g9pergrk651t512kmjg",
      override_agent_config: {
        prompt: {
          prompt: `You are Ms. Priya Sharma, an experienced Indian female school teacher. The student's name is ${userName} and they are in grade ${userGrade}. Start by greeting them warmly using their name and asking what subject they'd like help with today. Use an assertive but caring teaching style typical of Indian educators. Keep responses concise and engaging for voice interaction.`
        },
        first_message: `Hello ${userName}! Welcome to your learning session. I'm Ms. Priya Sharma, your teacher. Since you're in grade ${userGrade}, I'm here to help you with any subject you're studying. What would you like to learn about today?`
      }
    });
    
    return conversation;
  } catch (error) {
    console.error('ElevenLabs conversation initialization error:', error);
    throw new Error('Failed to initialize conversation with ElevenLabs');
  }
}

export async function getAITeacherResponse(request: AITeacherRequest): Promise<string> {
  try {
    // For now, return a placeholder response - full conversation handling will be done client-side
    return `Hello ${request.userName || 'Student'}! I'm Ms. Priya Sharma, ready to help you learn. What subject shall we explore today?`;
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    throw new Error('Failed to get AI response from ElevenLabs');
  }
}