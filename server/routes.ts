import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertQuizAttemptSchema } from "@shared/schema";
import { z } from "zod";
import { getAITeacherResponse } from "./ai-teacher";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user ID" });
    }
  });

  app.post("/api/users/:id/score", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { score } = req.body;
      
      if (typeof score !== "number") {
        return res.status(400).json({ error: "Score must be a number" });
      }
      
      const user = await storage.updateUserScore(id, score);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.post("/api/users/:id/streak", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { streak } = req.body;
      
      if (typeof streak !== "number") {
        return res.status(400).json({ error: "Streak must be a number" });
      }
      
      const user = await storage.updateUserStreak(id, streak);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Subject and progress routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  });

  app.get("/api/users/:id/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ error: "Invalid user ID" });
    }
  });

  app.post("/api/users/:userId/progress/:subjectId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const subjectId = parseInt(req.params.subjectId);
      const { completedTopics } = req.body;
      
      if (typeof completedTopics !== "number") {
        return res.status(400).json({ error: "Completed topics must be a number" });
      }
      
      const progress = await storage.updateUserProgress(userId, subjectId, completedTopics);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Video routes
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  app.get("/api/subjects/:id/videos", async (req, res) => {
    try {
      const subjectId = parseInt(req.params.id);
      const videos = await storage.getVideosBySubject(subjectId);
      res.json(videos);
    } catch (error) {
      res.status(400).json({ error: "Invalid subject ID" });
    }
  });

  app.post("/api/videos/:id/view", async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      await storage.incrementVideoViews(videoId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid video ID" });
    }
  });

  // Quiz routes
  app.get("/api/quiz/random", async (req, res) => {
    try {
      const quiz = await storage.getRandomQuiz();
      if (!quiz) {
        return res.status(404).json({ error: "No quizzes available" });
      }
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz" });
    }
  });

  app.get("/api/subjects/:id/quizzes", async (req, res) => {
    try {
      const subjectId = parseInt(req.params.id);
      const quizzes = await storage.getQuizzesBySubject(subjectId);
      res.json(quizzes);
    } catch (error) {
      res.status(400).json({ error: "Invalid subject ID" });
    }
  });

  app.post("/api/quiz/attempt", async (req, res) => {
    try {
      const attemptData = insertQuizAttemptSchema.parse(req.body);
      const attempt = await storage.submitQuizAttempt(attemptData);
      
      // Check for new achievements
      const newAchievements = await storage.checkAndAwardAchievements(attemptData.userId);
      
      res.json({ attempt, newAchievements });
    } catch (error) {
      res.status(400).json({ error: "Invalid quiz attempt data" });
    }
  });

  app.get("/api/users/:id/quiz-stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const stats = await storage.getUserQuizStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(400).json({ error: "Invalid user ID" });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  app.get("/api/users/:id/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      res.status(400).json({ error: "Invalid user ID" });
    }
  });

  // AI Teacher routes
  app.post("/api/ai-teacher", async (req, res) => {
    try {
      const { userMessage, teacherGender, conversationHistory, isWakeWord, isHintRequest } = req.body;
      
      if (!userMessage || !teacherGender) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const response = await getAITeacherResponse({
        userMessage,
        teacherGender,
        conversationHistory,
        isWakeWord,
        isHintRequest
      });
      
      res.json({ response });
    } catch (error) {
      console.error('AI Teacher API error:', error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
