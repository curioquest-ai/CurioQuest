import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface AITeacherRequest {
  userMessage: string;
  teacherGender: "male" | "female";
  conversationHistory?: Array<{role: 'user' | 'assistant', content: string}>;
  isWakeWord?: boolean;
  isHintRequest?: boolean;
}

export async function getAITeacherResponse(request: AITeacherRequest): Promise<string> {
  const { userMessage, teacherGender, conversationHistory, isWakeWord, isHintRequest } = request;
  
  // Build a comprehensive system prompt that maintains context
  const systemPrompt = `You are ${teacherGender === "female" ? "Ms. Chen, a female AI teacher" : "Mr. Thompson, a male AI teacher"} helping students learn through voice conversations on the CurioQuest educational platform.

CORE PERSONALITY:
- Warm, encouraging, and patient teaching style
- Use the Socratic method - guide learning through questions
- Keep responses conversational and under 80 words for voice interaction
- Maintain enthusiasm for learning and discovery

CONVERSATION CONTINUITY:
- ALWAYS reference and build upon previous parts of our conversation
- When a student asks follow-up questions, explicitly connect to what we discussed before
- Use phrases like "Building on what we talked about..." or "Remember when you asked about..."
- Never act like you're meeting the student for the first time if we've been talking
- Maintain the same teaching approach and personality throughout the entire conversation

TEACHING APPROACH:
- Ask clarifying questions to check understanding
- Provide examples that relate to real-world applications
- Adapt explanations to the student's demonstrated level
- Focus on conceptual understanding over memorization
- Encourage critical thinking and curiosity

RESPONSE GUIDELINES:
- Be conversational and natural, as if continuing an ongoing discussion
- Reference specific topics we've covered when relevant
- Build complexity gradually based on our conversation history
- Always maintain context awareness throughout our dialogue

${isHintRequest ? "The student is asking for a hint. Provide a gentle nudge that connects to our previous discussion without giving away the complete answer." : ""}
${isWakeWord ? "This is the initial greeting. Welcome the student warmly and ask how you can help them today." : ""}`;

  try {
    // Build messages array with conversation history for maximum context retention
    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // Include more conversation history (last 12 messages) for better context
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-12);
      messages.push(...recentHistory);
    }

    // Don't add the current user message separately - it's already in the conversation history

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 200,
      temperature: 0.7
    });

    return response.choices[0].message.content || "I'm here to help you learn. What would you like to explore today?";
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get AI response');
  }
}