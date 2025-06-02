import OpenAI from "openai";
import type { User, UserProgress, Subject, Video } from "@shared/schema";
import type { IStorage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AITeacherService {
  constructor(private storage: IStorage) {}

  async generateResponse(userId: number, message: string): Promise<string> {
    try {
      // Get user context
      const user = await this.storage.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Get user's learning progress
      const userProgress = await this.storage.getUserProgress(userId);
      const subjects = await this.storage.getAllSubjects();
      const videos = await this.storage.getAllVideos();
      const quizStats = await this.storage.getUserQuizStats(userId);
      const achievements = await this.storage.getUserAchievements(userId);

      // Build context about the user's learning journey
      const context = this.buildUserContext(user, userProgress, subjects, videos, quizStats, achievements);

      const systemPrompt = `You are an AI teacher for CurioQuest, a gamified educational platform. Your role is to provide personalized tutoring and guidance based on the student's learning progress.

Student Context:
${context}

Guidelines:
- Be encouraging and supportive
- Provide clear, age-appropriate explanations suitable for a grade ${user.grade} student
- Reference their actual progress and videos they've watched when relevant
- Suggest specific next steps based on their current learning state
- Use a friendly, enthusiastic tone that motivates learning
- If they ask about concepts from videos they haven't watched yet, encourage them to watch those videos first
- Help them understand connections between different subjects
- Celebrate their achievements and progress

Always respond as their personal AI teacher who knows their learning journey.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "I'm sorry, I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("AI Teacher error:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  private buildUserContext(
    user: User,
    userProgress: (UserProgress & { subject: Subject })[],
    subjects: Subject[],
    videos: Video[],
    quizStats: { totalAttempts: number; correctAnswers: number; totalPoints: number },
    achievements: any[]
  ): string {
    const watchedVideos = videos.filter(v => v.views > 0);
    const totalVideos = videos.length;
    
    const progressBySubject = userProgress.map(p => 
      `${p.subject.name}: ${p.completedTopics}/${p.subject.totalTopics} topics completed (${Math.round((p.completedTopics / p.subject.totalTopics) * 100)}%)`
    ).join('\n');

    const recentVideos = watchedVideos.slice(-3).map(v => v.title).join(', ');
    
    const accuracyRate = quizStats.totalAttempts > 0 
      ? Math.round((quizStats.correctAnswers / quizStats.totalAttempts) * 100) 
      : 0;

    return `Student: ${user.name}
Grade: ${user.grade}
School: ${user.school}
Current Score: ${user.totalScore} points
Current Streak: ${user.currentStreak} days

Learning Progress:
${progressBySubject}

Videos Progress: ${watchedVideos.length}/${totalVideos} videos watched
Recent videos watched: ${recentVideos || 'None yet'}

Quiz Performance:
- Total attempts: ${quizStats.totalAttempts}
- Accuracy rate: ${accuracyRate}%
- Points earned from quizzes: ${quizStats.totalPoints}

Achievements earned: ${achievements.length}
Overall engagement: ${user.currentStreak > 0 ? 'Active learner with good consistency' : 'New or returning student'}`;
  }
}