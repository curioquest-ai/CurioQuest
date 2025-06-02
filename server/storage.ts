import { 
  users, 
  subjects, 
  userProgress, 
  videos, 
  quizzes, 
  achievements, 
  userAchievements,
  quizAttempts,
  type User, 
  type InsertUser,
  type Subject,
  type Video,
  type Quiz,
  type Achievement,
  type UserProgress,
  type InsertUserProgress,
  type QuizAttempt,
  type InsertQuizAttempt,
  type UserAchievement
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserScore(id: number, score: number): Promise<User | undefined>;
  updateUserStreak(id: number, streak: number): Promise<User | undefined>;
  
  // Subject and progress management
  getAllSubjects(): Promise<Subject[]>;
  getUserProgress(userId: number): Promise<(UserProgress & { subject: Subject })[]>;
  updateUserProgress(userId: number, subjectId: number, completedTopics: number): Promise<UserProgress>;
  
  // Video management
  getAllVideos(): Promise<Video[]>;
  getVideosBySubject(subjectId: number): Promise<Video[]>;
  incrementVideoViews(videoId: number): Promise<void>;
  
  // Quiz management
  getQuizzesBySubject(subjectId: number): Promise<Quiz[]>;
  getRandomQuiz(): Promise<Quiz | undefined>;
  submitQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getUserQuizStats(userId: number): Promise<{ totalAttempts: number; correctAnswers: number; totalPoints: number }>;
  
  // Leaderboard
  getLeaderboard(limit?: number): Promise<User[]>;
  
  // Achievements
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]>;
  checkAndAwardAchievements(userId: number): Promise<UserAchievement[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subjects: Map<number, Subject>;
  private userProgress: Map<string, UserProgress>; // key: `${userId}-${subjectId}`
  private videos: Map<number, Video>;
  private quizzes: Map<number, Quiz>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<string, UserAchievement>; // key: `${userId}-${achievementId}`
  private quizAttempts: Map<number, QuizAttempt>;
  
  private currentUserId: number;
  private currentSubjectId: number;
  private currentVideoId: number;
  private currentQuizId: number;
  private currentAchievementId: number;
  private currentUserProgressId: number;
  private currentUserAchievementId: number;
  private currentQuizAttemptId: number;

  constructor() {
    this.users = new Map();
    this.subjects = new Map();
    this.userProgress = new Map();
    this.videos = new Map();
    this.quizzes = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.quizAttempts = new Map();
    
    this.currentUserId = 1;
    this.currentSubjectId = 1;
    this.currentVideoId = 1;
    this.currentQuizId = 1;
    this.currentAchievementId = 1;
    this.currentUserProgressId = 1;
    this.currentUserAchievementId = 1;
    this.currentQuizAttemptId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize subjects
    const subjectsData: Subject[] = [
      { id: 1, name: "Chemistry", icon: "flask", color: "#6C5CE7", totalTopics: 12 },
      { id: 2, name: "Mathematics", icon: "calculator", color: "#00B894", totalTopics: 10 },
      { id: 3, name: "English", icon: "book", color: "#FDCB6E", totalTopics: 8 },
      { id: 4, name: "Physics", icon: "atom", color: "#E17055", totalTopics: 15 },
      { id: 5, name: "Biology", icon: "dna", color: "#00E676", totalTopics: 14 }
    ];
    
    subjectsData.forEach(subject => {
      this.subjects.set(subject.id, subject);
      this.currentSubjectId = Math.max(this.currentSubjectId, subject.id + 1);
    });

    // Initialize sample users for leaderboard
    const sampleUsers: User[] = [
      {
        id: 2,
        name: "Emma Chen",
        grade: 10,
        school: "Lincoln High School",
        totalScore: 2850,
        currentStreak: 15,
        lastActiveDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        name: "Marcus Johnson",
        grade: 11,
        school: "Central Academy",
        totalScore: 2720,
        currentStreak: 12,
        lastActiveDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      },
      {
        id: 4,
        name: "Sofia Rodriguez",
        grade: 9,
        school: "Riverside High",
        totalScore: 2610,
        currentStreak: 18,
        lastActiveDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        id: 5,
        name: "James Liu",
        grade: 10,
        school: "Tech Valley High",
        totalScore: 2480,
        currentStreak: 8,
        lastActiveDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        id: 6,
        name: "Aisha Patel",
        grade: 11,
        school: "Innovation Academy",
        totalScore: 2390,
        currentStreak: 22,
        lastActiveDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      },
      {
        id: 7,
        name: "Alex Thompson",
        grade: 9,
        school: "Metro High School",
        totalScore: 2275,
        currentStreak: 6,
        lastActiveDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: 8,
        name: "Maya Singh",
        grade: 10,
        school: "Eastside Academy",
        totalScore: 2150,
        currentStreak: 14,
        lastActiveDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        id: 9,
        name: "David Kim",
        grade: 11,
        school: "Pioneer High",
        totalScore: 2040,
        currentStreak: 9,
        lastActiveDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        id: 10,
        name: "Isabella Garcia",
        grade: 9,
        school: "Summit Academy",
        totalScore: 1920,
        currentStreak: 11,
        lastActiveDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 11,
        name: "Ryan Williams",
        grade: 10,
        school: "Northside High",
        totalScore: 1850,
        currentStreak: 4,
        lastActiveDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        id: 12,
        name: "Zoe Anderson",
        grade: 11,
        school: "Valley High School",
        totalScore: 1730,
        currentStreak: 16,
        lastActiveDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 13,
        name: "Carlos Martinez",
        grade: 9,
        school: "Westfield Academy",
        totalScore: 1640,
        currentStreak: 7,
        lastActiveDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
      this.currentUserId = Math.max(this.currentUserId, user.id + 1);
    });

    // Initialize videos
    const videosData: Video[] = [
      {
        id: 1,
        title: "Chemistry Class: Molecular Bonding",
        description: "Interactive chemistry lesson on how molecules form bonds! 🧪",
        subjectId: 1,
        thumbnailUrl: "https://images.unsplash.com/photo-1532634893-8e5c6f9acc41?w=400",
        videoUrl: "/videos/snaptik_7306535208885423393.mp4",
        duration: 180,
        createdBy: "@ChemTeacher",
        likes: 342,
        views: 1850
      },
      {
        id: 2,
        title: "Math Made Easy: Quick Tips",
        description: "Master math concepts with this engaging lesson! 📐",
        subjectId: 2,
        thumbnailUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
        videoUrl: "/videos/snaptik_7446718113065798919.mp4",
        duration: 240,
        createdBy: "@MathGuru",
        likes: 528,
        views: 2340
      },
      {
        id: 3,
        title: "English Literature: Creative Writing",
        description: "Learn creative writing techniques from expert teachers! 📚",
        subjectId: 3,
        thumbnailUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
        videoUrl: "/videos/Lip Sync__OK CLASS. Today...._Rachel_Gen-4 Turbo Viral..._2025-05-30.mp4",
        duration: 195,
        createdBy: "@EnglishPro",
        likes: 412,
        views: 1920
      },
      {
        id: 4,
        title: "Science Fundamentals",
        description: "Essential science concepts explained in an engaging way! 🔬",
        subjectId: 4,
        thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        videoUrl: "/videos/Download.mp4",
        duration: 210,
        createdBy: "@ScienceTeacher",
        likes: 367,
        views: 1650
      }
    ];
    
    videosData.forEach(video => {
      this.videos.set(video.id, video);
      this.currentVideoId = Math.max(this.currentVideoId, video.id + 1);
    });

    // Initialize quizzes
    const quizzesData: Quiz[] = [
      {
        id: 1,
        subjectId: 1,
        question: "What happens when two hydrogen atoms bond with one oxygen atom?",
        options: ["They form carbon dioxide", "They form water (H₂O)", "They form methane", "Nothing happens"],
        correctAnswer: 1,
        explanation: "Two hydrogen atoms and one oxygen atom combine to form water (H₂O), which is essential for life.",
        difficulty: "easy"
      },
      {
        id: 2,
        subjectId: 2,
        question: "What is the value of x in the equation 2x + 5 = 13?",
        options: ["x = 3", "x = 4", "x = 5", "x = 6"],
        correctAnswer: 1,
        explanation: "Solving 2x + 5 = 13: 2x = 8, therefore x = 4",
        difficulty: "easy"
      },
      {
        id: 3,
        subjectId: 3,
        question: "Who wrote the famous play 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correctAnswer: 1,
        explanation: "William Shakespeare wrote Romeo and Juliet, one of his most famous tragedies.",
        difficulty: "easy"
      }
    ];
    
    quizzesData.forEach(quiz => {
      this.quizzes.set(quiz.id, quiz);
      this.currentQuizId = Math.max(this.currentQuizId, quiz.id + 1);
    });

    // Initialize achievements
    const achievementsData: Achievement[] = [
      {
        id: 1,
        name: "First Steps",
        description: "Complete your first video",
        icon: "play",
        color: "#00E676",
        requirement: { type: "videos_watched", value: 1 }
      },
      {
        id: 2,
        name: "Quiz Master",
        description: "Score 100% on 5 quizzes",
        icon: "medal",
        color: "#FDCB6E",
        requirement: { type: "perfect_quizzes", value: 5 }
      },
      {
        id: 3,
        name: "Speed Learner",
        description: "Watch 20 videos in one session",
        icon: "lightning-bolt",
        color: "#6C5CE7",
        requirement: { type: "videos_watched", value: 20 }
      },
      {
        id: 4,
        name: "Streak Master",
        description: "Maintain a 7-day learning streak",
        icon: "fire",
        color: "#E17055",
        requirement: { type: "streak_days", value: 7 }
      }
    ];
    
    achievementsData.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
      this.currentAchievementId = Math.max(this.currentAchievementId, achievement.id + 1);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      totalScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      videosWatched: 0,
      quizzesCompleted: 0,
      createdAt: new Date()
    };
    this.users.set(id, user);
    
    // Initialize user progress for all subjects
    for (const subject of Array.from(this.subjects.values())) {
      const progressKey = `${id}-${subject.id}`;
      const progress: UserProgress = {
        id: this.currentUserProgressId++,
        userId: id,
        subjectId: subject.id,
        completedTopics: 0,
        lastTopicCompleted: null
      };
      this.userProgress.set(progressKey, progress);
    }
    
    return user;
  }

  async updateUserScore(id: number, score: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, totalScore: user.totalScore + score };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStreak(id: number, streak: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      currentStreak: streak,
      longestStreak: Math.max(user.longestStreak, streak),
      lastActiveDate: new Date().toISOString().split('T')[0]
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getUserProgress(userId: number): Promise<(UserProgress & { subject: Subject })[]> {
    const result: (UserProgress & { subject: Subject })[] = [];
    
    for (const subject of this.subjects.values()) {
      const progressKey = `${userId}-${subject.id}`;
      const progress = this.userProgress.get(progressKey);
      if (progress) {
        result.push({ ...progress, subject });
      }
    }
    
    return result;
  }

  async updateUserProgress(userId: number, subjectId: number, completedTopics: number): Promise<UserProgress> {
    const progressKey = `${userId}-${subjectId}`;
    const existing = this.userProgress.get(progressKey);
    
    if (!existing) {
      throw new Error("User progress not found");
    }
    
    const updated = { 
      ...existing, 
      completedTopics,
      lastTopicCompleted: new Date().toISOString()
    };
    this.userProgress.set(progressKey, updated);
    return updated;
  }

  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async getVideosBySubject(subjectId: number): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(video => video.subjectId === subjectId);
  }

  async incrementVideoViews(videoId: number): Promise<void> {
    const video = this.videos.get(videoId);
    if (video) {
      this.videos.set(videoId, { ...video, views: video.views + 1 });
    }
  }

  async getQuizzesBySubject(subjectId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(quiz => quiz.subjectId === subjectId);
  }

  async getRandomQuiz(): Promise<Quiz | undefined> {
    const allQuizzes = Array.from(this.quizzes.values());
    if (allQuizzes.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * allQuizzes.length);
    return allQuizzes[randomIndex];
  }

  async submitQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const id = this.currentQuizAttemptId++;
    const quizAttempt: QuizAttempt = {
      ...attempt,
      id,
      completedAt: new Date()
    };
    
    this.quizAttempts.set(id, quizAttempt);
    
    // Update user stats
    const user = this.users.get(attempt.userId);
    if (user) {
      const updatedUser = {
        ...user,
        totalScore: user.totalScore + attempt.pointsEarned,
        quizzesCompleted: user.quizzesCompleted + 1
      };
      this.users.set(attempt.userId, updatedUser);
    }
    
    return quizAttempt;
  }

  async getUserQuizStats(userId: number): Promise<{ totalAttempts: number; correctAnswers: number; totalPoints: number }> {
    const userAttempts = Array.from(this.quizAttempts.values()).filter(attempt => attempt.userId === userId);
    
    return {
      totalAttempts: userAttempts.length,
      correctAnswers: userAttempts.filter(attempt => attempt.isCorrect).length,
      totalPoints: userAttempts.reduce((sum, attempt) => sum + attempt.pointsEarned, 0)
    };
  }

  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const result: (UserAchievement & { achievement: Achievement })[] = [];
    
    for (const userAchievement of this.userAchievements.values()) {
      if (userAchievement.userId === userId) {
        const achievement = this.achievements.get(userAchievement.achievementId);
        if (achievement) {
          result.push({ ...userAchievement, achievement });
        }
      }
    }
    
    return result;
  }

  async checkAndAwardAchievements(userId: number): Promise<UserAchievement[]> {
    const user = this.users.get(userId);
    if (!user) return [];
    
    const newAchievements: UserAchievement[] = [];
    const userAchievementIds = Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId)
      .map(ua => ua.achievementId);
    
    for (const achievement of this.achievements.values()) {
      if (userAchievementIds.includes(achievement.id)) continue;
      
      let shouldAward = false;
      
      switch (achievement.requirement.type) {
        case "videos_watched":
          shouldAward = user.videosWatched >= achievement.requirement.value;
          break;
        case "streak_days":
          shouldAward = user.currentStreak >= achievement.requirement.value;
          break;
        case "perfect_quizzes":
          const perfectQuizzes = Array.from(this.quizAttempts.values())
            .filter(attempt => attempt.userId === userId && attempt.isCorrect).length;
          shouldAward = perfectQuizzes >= achievement.requirement.value;
          break;
      }
      
      if (shouldAward) {
        const userAchievement: UserAchievement = {
          id: this.currentUserAchievementId++,
          userId,
          achievementId: achievement.id,
          earnedAt: new Date()
        };
        
        const key = `${userId}-${achievement.id}`;
        this.userAchievements.set(key, userAchievement);
        newAchievements.push(userAchievement);
      }
    }
    
    return newAchievements;
  }
}

export const storage = new MemStorage();
