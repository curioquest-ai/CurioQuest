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
  
  let systemPrompt = `You are an AI teacher assistant. You are ${teacherGender === "female" ? "a female teacher" : "a male teacher"} helping students learn through voice conversations. 

Key guidelines:
- Be encouraging, patient, and supportive
- Use the Socratic method - ask questions to guide learning rather than giving direct answers
- Keep responses conversational and under 100 words for voice interaction
- Adapt to the student's level and provide appropriate explanations
- Remember previous parts of the conversation and build upon them
- Help with any subject but focus on understanding concepts rather than memorization
- Reference earlier topics when relevant to help reinforce learning`;

  if (isHintRequest) {
    systemPrompt += "\n- The student is asking for a hint. Provide a gentle nudge without giving away the answer completely.";
  }

  if (isWakeWord) {
    systemPrompt += "\n- This is the initial greeting. Welcome the student and ask how you can help them today.";
  }

  try {
    // Build messages array with conversation history
    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // Add conversation history if it exists (last 10 messages to maintain context)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-10);
      messages.push(...recentHistory);
    }

    // Add the current user message
    messages.push({
      role: "user",
      content: userMessage
    });

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