import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Flame, Medal, Zap, Trophy, Calculator, Book, FlaskRound, Atom, Dna } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import BottomNavigation from "@/components/bottom-navigation";

const subjectIcons = {
  flask: FlaskRound,
  calculator: Calculator,
  book: Book,
  atom: Atom,
  dna: Dna,
};

const achievementIcons = {
  play: Star,
  medal: Medal,
  "lightning-bolt": Zap,
  fire: Flame,
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "progress"],
    enabled: !!user?.id,
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "achievements"],
    enabled: !!user?.id,
  });

  const { data: quizStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "quiz-stats"],
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }

  const isLoading = progressLoading || achievementsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background overflow-y-auto safe-area-inset">
      <div className="p-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/feed")}
              className="text-foreground hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
        </motion.div>

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="gradient-card border-none">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Welcome back, {user.name}!</h2>
                <p className="text-muted-foreground">
                  {user.school} • Grade {user.grade}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>



        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Subject Progress</h3>
              
              <div className="space-y-4">
                {progress.map((item, index) => {
                  const IconComponent = subjectIcons[item.subject.icon as keyof typeof subjectIcons] || Book;
                  const percentage = Math.round((item.completedTopics / item.subject.totalTopics) * 100);
                  
                  return (
                    <motion.div
                      key={item.subject.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: item.subject.color }}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.subject.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.completedTopics}/{item.subject.totalTopics} topics completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-accent">{percentage}%</p>
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-full bg-accent rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-6"
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
                <div className="space-y-3">
                  {achievements.slice(0, 3).map((userAchievement, index) => {
                    const IconComponent = achievementIcons[userAchievement.achievement.icon as keyof typeof achievementIcons] || Medal;
                    
                    return (
                      <motion.div
                        key={userAchievement.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="flex items-center space-x-3"
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: userAchievement.achievement.color }}
                        >
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{userAchievement.achievement.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {userAchievement.achievement.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <BottomNavigation currentPage="dashboard" />
    </div>
  );
}
