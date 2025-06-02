import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crown, Medal, TrendingUp, TrendingDown, Minus, Filter, Sparkles, Target, Zap, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import BottomNavigation from "@/components/bottom-navigation";

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentUserRank = leaderboard.findIndex(u => u.id === user?.id) + 1;
  const top3 = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-accent" />;
      case 2:
        return <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-background">2</div>;
      case 3:
        return <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-xs font-bold text-background">3</div>;
      default:
        return <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-bold">{rank}</div>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="h-screen w-full bg-gradient-to-b from-primary/5 to-background overflow-y-auto safe-area-inset">
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
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Hall of Fame
              </h1>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-accent"
              >
                <Crown className="w-6 h-6" />
              </motion.div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-accent">
            <Filter className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Motivational Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Your Goal</p>
                    <p className="text-xs text-muted-foreground">
                      {currentUserRank > 3 
                        ? `Climb ${currentUserRank - 3} spots to reach top 3!`
                        : currentUserRank === 0 
                        ? "Start learning to join the leaderboard!"
                        : "You're in the top 3! Keep it up!"
                      }
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center space-x-1 text-accent"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    {currentUserRank === 1 ? "Champion!" 
                     : currentUserRank <= 3 ? "Top 3!" 
                     : `#${currentUserRank}`}
                  </span>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Time Filter */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-2 mb-6"
        >
          <Badge variant="default" className="bg-primary text-primary-foreground">
            This Week
          </Badge>
          <Badge variant="outline">This Month</Badge>
          <Badge variant="outline">All Time</Badge>
        </motion.div>

        {/* Championship Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-b from-primary/5 via-background to-accent/5 border-2 border-primary/20 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent rounded-full text-white font-bold text-sm"
                >
                  <Crown className="w-4 h-4" />
                  <span>Champions</span>
                  <Crown className="w-4 h-4" />
                </motion.div>
              </div>

              <div className="flex justify-center items-end space-x-8">
                {/* 2nd Place - Silver */}
                {top3[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, type: "spring", bounce: 0.4 }}
                    className="text-center relative"
                  >
                    {/* Podium Base */}
                    <div className="w-20 h-16 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative"
                    >
                      <Avatar className="w-18 h-18 mx-auto mb-3 border-4 border-gray-400 shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 text-white font-bold text-lg">
                          {getInitials(top3[1].name)}
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Medal className="w-4 h-4 text-white" />
                      </motion.div>
                    </motion.div>
                    
                    <p className="text-sm font-bold">{top3[1].name}</p>
                    <p className="text-lg font-bold text-gray-500">{top3[1].totalScore.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </motion.div>
                )}
                
                {/* 1st Place - Gold */}
                {top3[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                    className="text-center relative"
                  >
                    {/* Podium Base - Highest */}
                    <div className="w-24 h-20 bg-gradient-to-t from-accent to-yellow-300 rounded-t-lg mb-4 flex items-center justify-center relative">
                      <span className="text-3xl font-bold text-white">1</span>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                      >
                        <Sparkles className="w-6 h-6 text-accent" />
                      </motion.div>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative"
                    >
                      <Avatar className="w-24 h-24 mx-auto mb-3 border-4 border-accent shadow-2xl">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-xl">
                          {getInitials(top3[0].name)}
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-4 -right-2 w-10 h-10 bg-gradient-to-br from-accent to-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Crown className="w-5 h-5 text-white" />
                      </motion.div>
                    </motion.div>
                    
                    <p className="text-lg font-bold text-primary">{top3[0].name}</p>
                    <p className="text-2xl font-bold text-accent">{top3[0].totalScore.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">points</p>
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xs text-accent font-semibold mt-1"
                    >
                      🏆 CHAMPION
                    </motion.div>
                  </motion.div>
                )}
                
                {/* 3rd Place - Bronze */}
                {top3[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
                    className="text-center relative"
                  >
                    {/* Podium Base */}
                    <div className="w-20 h-12 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative"
                    >
                      <Avatar className="w-18 h-18 mx-auto mb-3 border-4 border-amber-500 shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold text-lg">
                          {getInitials(top3[2].name)}
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 2 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Star className="w-4 h-4 text-white" />
                      </motion.div>
                    </motion.div>
                    
                    <p className="text-sm font-bold">{top3[2].name}</p>
                    <p className="text-lg font-bold text-amber-600">{top3[2].totalScore.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </motion.div>
                )}
              </div>

              {/* Particle effects */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute top-4 left-4 text-accent opacity-70"
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                className="absolute top-6 right-6 text-primary opacity-70"
              >
                <Star className="w-3 h-3" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 2.5 }}
                className="absolute bottom-8 right-8 text-accent opacity-70"
              >
                <Zap className="w-4 h-4" />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current User Position (if not in top 3) */}
        {currentUserRank > 3 && user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="relative"
                    >
                      {getRankIcon(currentUserRank)}
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"
                      />
                    </motion.div>
                    <Avatar className="w-12 h-12 border-2 border-primary">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-primary">{user.name}</p>
                      <p className="text-sm text-accent font-semibold">That's You!</p>
                      <p className="text-xs text-muted-foreground">Grade {user.grade}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{user.totalScore.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                    <motion.div
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-xs text-accent font-semibold mt-1"
                    >
                      Keep climbing! 📈
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Rising Stars Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-4"
        >
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-1 bg-gradient-to-r from-primary to-accent rounded-full">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-primary">Rising Stars</h3>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-accent" />
            </motion.div>
          </div>
        </motion.div>

        {/* Rest of Rankings */}
        <div className="space-y-3">
          {restOfLeaderboard.map((participant, index) => {
            const rank = index + 4; // Starting from 4th position
            const isCurrentUser = participant.id === user?.id;
            const trendValue = Math.floor(Math.random() * 100) - 30; // -30 to +70 range
            const isRising = trendValue > 0;
            const isStable = trendValue === 0;
            
            return (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Card className={`transition-all duration-300 ${
                  isCurrentUser 
                    ? "border-2 border-primary/40 bg-gradient-to-r from-primary/5 to-accent/5 shadow-lg" 
                    : "hover:border-primary/20 hover:shadow-md"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="relative"
                        >
                          {getRankIcon(rank)}
                          {isRising && rank <= 10 && (
                            <motion.div
                              animate={{ y: [0, -2, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
                            />
                          )}
                        </motion.div>
                        
                        <Avatar className={`w-11 h-11 transition-all duration-300 ${
                          isCurrentUser ? "border-2 border-primary" : "group-hover:scale-105"
                        }`}>
                          <AvatarFallback className={`font-bold text-sm ${
                            isCurrentUser 
                              ? "bg-gradient-to-br from-primary to-accent text-white" 
                              : "bg-gradient-to-br from-muted to-muted-foreground/20"
                          }`}>
                            {getInitials(participant.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <p className={`font-medium ${isCurrentUser ? 'text-primary font-bold' : ''}`}>
                            {participant.name}
                            {isCurrentUser && (
                              <span className="text-accent font-semibold ml-1">(You)</span>
                            )}
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-muted-foreground">Grade {participant.grade}</p>
                            {isRising && rank <= 10 && (
                              <Badge variant="secondary" className="text-xs px-1 py-0 bg-green-100 text-green-700">
                                Hot
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          isCurrentUser ? 'text-primary' : 'text-foreground'
                        }`}>
                          {participant.totalScore.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mb-1">points</p>
                        
                        <motion.div 
                          className="flex items-center justify-end space-x-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                        >
                          {isRising ? (
                            <>
                              <TrendingUp className="w-3 h-3 text-green-500" />
                              <span className="text-green-500 font-semibold">+{trendValue}</span>
                            </>
                          ) : isStable ? (
                            <>
                              <Minus className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">—</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-3 h-3 text-red-500" />
                              <span className="text-red-500 font-semibold">{trendValue}</span>
                            </>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Motivational Call-to-Action */}
        {restOfLeaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8 mb-6"
          >
            <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
              <CardContent className="p-6 text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Target className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-lg font-bold text-primary mb-2">Ready to Climb Higher?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Watch more videos, complete quizzes, and maintain your streak to boost your ranking!
                </p>
                <Button 
                  onClick={() => setLocation("/feed")} 
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold"
                >
                  Start Learning
                  <Zap className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <BottomNavigation currentPage="leaderboard" />
    </div>
  );
}
