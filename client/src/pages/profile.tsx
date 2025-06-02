import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import BottomNavigation from "@/components/bottom-navigation";
import StreakIndicator from "@/components/streak-indicator";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Target, 
  Calendar, 
  BookOpen, 
  Zap, 
  Star,
  TrendingUp,
  Award,
  Crown,
  Flame,
  ChevronRight,
  Settings,
  Share2,
  Edit,
  Medal,
  Sparkles,
  Brain,
  Clock,
  Users
} from "lucide-react";
import { getUserInitials, calculateUserLevel, getAchievementProgress } from "@/lib/auth";
import type { User, Subject, UserProgress, Achievement, UserAchievement } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
    enabled: !!user
  });

  const { data: userProgress = [] } = useQuery<(UserProgress & { subject: Subject })[]>({
    queryKey: ['/api/users', user?.id, 'progress'],
    enabled: !!user
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
    enabled: !!user
  });

  const { data: userAchievements = [] } = useQuery<(UserAchievement & { achievement: Achievement })[]>({
    queryKey: ['/api/users', user?.id, 'achievements'],
    enabled: !!user
  });

  const { data: leaderboard = [] } = useQuery<User[]>({
    queryKey: ['/api/leaderboard'],
    enabled: !!user
  });

  const { data: quizStats } = useQuery({
    queryKey: ["/api/users", user?.id, "quiz-stats"],
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Please log in to view your profile</p>
      </div>
    );
  }

  const userLevel = calculateUserLevel(user.totalScore);
  const userRank = leaderboard.findIndex(u => u.id === user.id) + 1;
  const earnedAchievements = userAchievements.length;
  const totalAchievements = achievements.length;
  
  // Use actual data from user object
  const totalVideosWatched = user.videosWatched || 0;
  const totalQuizzesCompleted = user.quizzesCompleted || 0;

  // Calculate subject progress stats
  const subjectStats = subjects.map(subject => {
    const progress = userProgress.find(p => p.subjectId === subject.id);
    const completionRate = progress ? (progress.completedTopics / subject.totalTopics) * 100 : 0;
    return {
      ...subject,
      completedTopics: progress?.completedTopics || 0,
      completionRate,
      score: Math.floor(Math.random() * 500) + 100 // Simulated subject score
    };
  });

  const avgCompletionRate = subjectStats.length > 0 
    ? subjectStats.reduce((sum, s) => sum + s.completionRate, 0) / subjectStats.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-primary to-accent text-white p-6 pb-16"
      >
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="relative"
          >
            <Avatar className="w-20 h-20 border-4 border-white/30">
              <AvatarFallback className="bg-gradient-to-br from-white to-white/90 text-primary text-2xl font-bold">
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            {userRank <= 3 && (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2"
              >
                <Crown className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
              </motion.div>
            )}
          </motion.div>

          <div className="flex-1">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-1"
            >
              {user.name}
              <Button variant="ghost" size="sm" className="ml-2 text-white/80 hover:text-white">
                <Edit className="w-4 h-4" />
              </Button>
            </motion.h1>
            <p className="text-white/80 mb-2">Grade {user.grade} • {user.school}</p>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Level {userLevel.level}
              </Badge>
              {userRank > 0 && (
                <Badge variant="secondary" className="bg-yellow-400/20 text-white border-yellow-400/30">
                  #{userRank} Global
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="text-center">
            <p className="text-3xl font-bold">{user.totalScore.toLocaleString()}</p>
            <p className="text-white/80 text-sm">Total Points</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{user.currentStreak}</p>
            <p className="text-white/80 text-sm">Day Streak</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{avgCompletionRate.toFixed(0)}%</p>
            <p className="text-white/80 text-sm">Avg Progress</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="px-4 mt-4 pb-24 space-y-6">
        {/* Level Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-lg border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-full">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Level {userLevel.level}</h3>
                    <p className="text-sm text-muted-foreground">
                      {userLevel.nextLevelScore > userLevel.currentLevelScore 
                        ? `${userLevel.nextLevelScore - user.totalScore} points to Level ${userLevel.level + 1}`
                        : "Max level reached!"
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{userLevel.progress}%</p>
                </div>
              </div>
              <Progress value={userLevel.progress} className="h-3" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievement Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-r from-accent to-primary rounded-full">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">Achievements</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {earnedAchievements}/{totalAchievements} earned
                </p>
              </div>

              {userAchievements.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {userAchievements.slice(0, 4).map((userAch) => (
                    <motion.div
                      key={userAch.id}
                      whileHover={{ scale: 1.05 }}
                      className="p-3 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border border-accent/20"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Award className="w-4 h-4 text-accent" />
                        <p className="font-semibold text-sm">{userAch.achievement.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{userAch.achievement.description}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Medal className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No achievements yet</p>
                  <p className="text-sm text-muted-foreground">Keep learning to unlock your first achievement!</p>
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full border-primary/30 hover:bg-primary/5"
              >
                View All Achievements
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg">Learning Stats</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                  <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{totalVideosWatched}</p>
                  <p className="text-sm text-blue-600/70">Videos Watched</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-lg">
                  <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{totalQuizzesCompleted}</p>
                  <p className="text-sm text-purple-600/70">Quizzes Completed</p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg">
                  <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{user.currentStreak}</p>
                  <p className="text-sm text-orange-600/70">Day Streak</p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                  <Medal className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {quizStats && quizStats.totalAttempts > 0 
                      ? Math.round((quizStats.correctAnswers / quizStats.totalAttempts) * 100)
                      : 0}%
                  </p>
                  <p className="text-sm text-green-600/70">Quiz Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subject Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg">Subject Progress</h3>
              </div>

              <div className="space-y-4">
                {subjectStats.map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="p-4 border border-border rounded-lg hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: `${subject.color}20` }}>
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
                        </div>
                        <div>
                          <p className="font-semibold">{subject.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {subject.completedTopics}/{subject.totalTopics} topics
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{subject.score}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                    <Progress value={subject.completionRate} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {subject.completionRate.toFixed(0)}% complete
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="shadow-lg bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-primary mb-2">Keep the Momentum Going!</h3>
              <p className="text-muted-foreground mb-4">
                You're doing amazing! Continue learning to level up and unlock new achievements.
              </p>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setLocation("/feed")}
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Continue Learning
                </Button>
                <Button 
                  onClick={() => setLocation("/leaderboard")}
                  variant="outline" 
                  className="flex-1 border-primary/30 hover:bg-primary/5"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <BottomNavigation currentPage="profile" />
    </div>
  );
}