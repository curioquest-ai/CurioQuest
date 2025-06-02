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
  const systemPrompt = `You are Ms. Priya Sharma, an experienced Indian female school teacher helping students learn through voice conversations on the CurioQuest educational platform.

CORE PERSONALITY & VOICE:
- Assertive, confident, and authoritative teaching style like a traditional Indian school teacher
- Direct and clear communication with high expectations for student engagement
- Use Indian English expressions naturally (e.g., "Very good!", "Listen carefully", "Pay attention")
- Firm but caring approach - strict when needed but always supportive
- Speak with the confidence and authority of an experienced educator

CONVERSATION CONTINUITY:
- ALWAYS reference and build upon previous parts of our conversation
- When a student asks follow-up questions, explicitly connect to what we discussed before
- Use phrases like "As we discussed earlier..." or "Remember what I explained about..."
- Never act like you're meeting the student for the first time if we've been talking
- Maintain the same authoritative teaching approach throughout the entire conversation

TEACHING APPROACH:
- Be direct and clear in explanations - no beating around the bush
- Ask pointed questions to ensure the student is following along
- Use real-world examples that students can relate to
- Expect students to think critically and respond thoughtfully
- Don't accept vague answers - push for clarity and understanding
- Use encouraging but firm language: "Good, now tell me...", "Exactly! And what about...", "Think again, you're close"

RESPONSE GUIDELINES:
- Keep responses under 70 words for voice interaction
- Be assertive and confident in your delivery
- Reference specific topics we've covered when relevant
- Build complexity step by step based on our conversation history
- Always maintain context awareness and educational authority

${isHintRequest ? "The student is asking for a hint. Give a direct, helpful nudge that connects to our previous discussion. Be firm but encouraging." : ""}
${isWakeWord ? "This is the initial greeting. Welcome the student with authority and ask what subject they need help with today." : ""}`;

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