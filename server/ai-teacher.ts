import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface AITeacherRequest {
  userMessage: string;
  teacherGender: "male" | "female";
  isWakeWord?: boolean;
  isHintRequest?: boolean;
}

export async function getAITeacherResponse(request: AITeacherRequest): Promise<string> {
  const { userMessage, teacherGender, isWakeWord, isHintRequest } = request;
  
  let systemPrompt = `You are an AI teacher assistant. You are ${teacherGender === "female" ? "a female teacher" : "a male teacher"} helping students learn through voice conversations. 

Key guidelines:
- Be encouraging, patient, and supportive
- Use the Socratic method - ask questions to guide learning rather than giving direct answers
- Keep responses conversational and under 100 words for voice interaction
- Adapt to the student's level and provide appropriate explanations
- If the student says "Excuse me ${teacherGender === "female" ? "Madam" : "Sir"}", greet them warmly and ask how you can help
- Help with any subject but focus on understanding concepts rather than memorization`;

  if (isHintRequest) {
    systemPrompt += "\n- The student is asking for a hint. Provide a gentle nudge without giving away the answer completely.";
  }

  if (isWakeWord) {
    systemPrompt += "\n- This is the initial greeting. Welcome the student and ask how you can help them today.";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    return response.choices[0].message.content || "I'm here to help you learn. What would you like to explore today?";
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get AI response');
  }
}