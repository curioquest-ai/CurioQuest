import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Medal, TrendingUp, TrendingDown, Minus, Filter } from "lucide-react";

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
            <h1 className="text-2xl font-bold">Leaderboard</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-accent">
            <Filter className="w-5 h-5" />
          </Button>
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

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-center items-end space-x-6">
                {/* 2nd Place */}
                {top3[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                  >
                    <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-gray-400">
                      <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 text-white font-bold">
                        {getInitials(top3[1].name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-sm font-bold text-background">2</span>
                    </div>
                    <p className="text-sm font-medium">{top3[1].name}</p>
                    <p className="text-xs text-muted-foreground">{top3[1].totalScore.toLocaleString()} pts</p>
                  </motion.div>
                )}
                
                {/* 1st Place */}
                {top3[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <Avatar className="w-20 h-20 mx-auto mb-2 border-4 border-accent">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-lg">
                        {getInitials(top3[0].name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mx-auto mb-1">
                      <Crown className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <p className="text-sm font-medium">{top3[0].name}</p>
                    <p className="text-xs text-muted-foreground">{top3[0].totalScore.toLocaleString()} pts</p>
                  </motion.div>
                )}
                
                {/* 3rd Place */}
                {top3[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                  >
                    <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-yellow-600">
                      <AvatarFallback className="bg-gradient-to-br from-yellow-600 to-yellow-700 text-white font-bold">
                        {getInitials(top3[2].name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-sm font-bold text-background">3</span>
                    </div>
                    <p className="text-sm font-medium">{top3[2].name}</p>
                    <p className="text-xs text-muted-foreground">{top3[2].totalScore.toLocaleString()} pts</p>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current User Position (if not in top 3) */}
        {currentUserRank > 3 && user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-4"
          >
            <Card className="border-accent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getRankIcon(currentUserRank)}
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-accent text-accent-foreground font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name} (You)</p>
                      <p className="text-xs text-muted-foreground">Grade {user.grade}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent">{user.totalScore.toLocaleString()} pts</p>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Minus className="w-3 h-3" />
                      <span>—</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Rest of Rankings */}
        <div className="space-y-3">
          {restOfLeaderboard.map((participant, index) => {
            const rank = index + 4; // Starting from 4th position
            const isCurrentUser = participant.id === user?.id;
            
            return (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Card className={isCurrentUser ? "border-accent" : undefined}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getRankIcon(rank)}
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-muted to-muted-foreground/20 font-bold">
                            {getInitials(participant.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {participant.name}
                            {isCurrentUser && " (You)"}
                          </p>
                          <p className="text-xs text-muted-foreground">Grade {participant.grade}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${isCurrentUser ? 'text-accent' : ''}`}>
                          {participant.totalScore.toLocaleString()} pts
                        </p>
                        <div className="flex items-center space-x-1 text-xs">
                          {/* Simulate trend - in real app this would come from backend */}
                          {Math.random() > 0.5 ? (
                            <>
                              <TrendingUp className="w-3 h-3 text-success" />
                              <span className="text-success">+{Math.floor(Math.random() * 50) + 5}</span>
                            </>
                          ) : Math.random() > 0.3 ? (
                            <>
                              <TrendingDown className="w-3 h-3 text-destructive" />
                              <span className="text-destructive">-{Math.floor(Math.random() * 20) + 1}</span>
                            </>
                          ) : (
                            <>
                              <Minus className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">—</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <BottomNavigation currentPage="leaderboard" />
    </div>
  );
}
