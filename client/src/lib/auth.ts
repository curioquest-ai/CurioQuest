import type { User } from "@shared/schema";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  name: string;
  grade: number;
  school: string;
}

export const AUTH_STORAGE_KEY = "curioquest_user";

export function getStoredUser(): User | null {
  try {
    const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedData) return null;
    
    const userData = JSON.parse(storedData);
    
    // Validate the stored data structure
    if (!userData.id || !userData.name || !userData.grade || !userData.school) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    
    return userData as User;
  } catch (error) {
    console.error("Error parsing stored user data:", error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function setStoredUser(user: User): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error storing user data:", error);
  }
}

export function removeStoredUser(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isValidUser(user: any): user is User {
  return (
    user &&
    typeof user.id === "number" &&
    typeof user.name === "string" &&
    typeof user.grade === "number" &&
    typeof user.school === "string" &&
    typeof user.totalScore === "number" &&
    typeof user.currentStreak === "number" &&
    typeof user.longestStreak === "number" &&
    typeof user.videosWatched === "number" &&
    typeof user.quizzesCompleted === "number"
  );
}

export function getUserInitials(name: string): string {
  return name
    .split(" ")
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calculateUserLevel(totalScore: number): {
  level: number;
  currentLevelScore: number;
  nextLevelScore: number;
  progress: number;
} {
  // Level calculation: every 1000 points = 1 level
  const level = Math.floor(totalScore / 1000) + 1;
  const currentLevelScore = totalScore % 1000;
  const nextLevelScore = 1000;
  const progress = (currentLevelScore / nextLevelScore) * 100;
  
  return {
    level,
    currentLevelScore,
    nextLevelScore,
    progress,
  };
}

export function formatScore(score: number): string {
  if (score >= 1000000) {
    return `${(score / 1000000).toFixed(1)}M`;
  } else if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}k`;
  }
  return score.toString();
}

export function calculateStreakBonus(streak: number): number {
  // Bonus multiplier based on streak
  if (streak >= 30) return 3.0; // 3x multiplier for 30+ day streak
  if (streak >= 14) return 2.5; // 2.5x multiplier for 2+ week streak
  if (streak >= 7) return 2.0;  // 2x multiplier for 1+ week streak
  if (streak >= 3) return 1.5;  // 1.5x multiplier for 3+ day streak
  return 1.0; // No bonus for streaks less than 3 days
}

export function getAchievementProgress(user: User): {
  videosWatched: { current: number; target: number; percentage: number };
  quizzesCompleted: { current: number; target: number; percentage: number };
  streakDays: { current: number; target: number; percentage: number };
  totalScore: { current: number; target: number; percentage: number };
} {
  return {
    videosWatched: {
      current: user.videosWatched,
      target: 100,
      percentage: Math.min((user.videosWatched / 100) * 100, 100),
    },
    quizzesCompleted: {
      current: user.quizzesCompleted,
      target: 50,
      percentage: Math.min((user.quizzesCompleted / 50) * 100, 100),
    },
    streakDays: {
      current: user.currentStreak,
      target: 30,
      percentage: Math.min((user.currentStreak / 30) * 100, 100),
    },
    totalScore: {
      current: user.totalScore,
      target: 10000,
      percentage: Math.min((user.totalScore / 10000) * 100, 100),
    },
  };
}

export function isStreakActive(lastActiveDate: string | null): boolean {
  if (!lastActiveDate) return false;
  
  const lastActive = new Date(lastActiveDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastActive.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Streak is active if last activity was today or yesterday
  return diffDays <= 1;
}

export function shouldUpdateStreak(lastActiveDate: string | null): boolean {
  if (!lastActiveDate) return true;
  
  const lastActive = new Date(lastActiveDate);
  const today = new Date();
  
  // Only update streak if it's a new day
  return lastActive.toDateString() !== today.toDateString();
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid user information provided",
  STORAGE_ERROR: "Failed to save user data",
  USER_NOT_FOUND: "User not found",
  INVALID_SESSION: "Invalid or expired session",
} as const;

export type AuthError = typeof AUTH_ERRORS[keyof typeof AUTH_ERRORS];
