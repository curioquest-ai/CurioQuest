import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share, Bookmark, ChartLine, Trophy, Home, PieChart, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getUserInitials } from "@/lib/auth";
import VideoPlayer from "@/components/video-player";
import StreakIndicator from "@/components/streak-indicator";
import BottomNavigation from "@/components/bottom-navigation";
import type { Video } from "@shared/schema";

export default function VideoFeed() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videosWatched, setVideosWatched] = useState(0);
  const [timeWatched, setTimeWatched] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"up" | "down" | null>(null);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"],
  });

  const incrementViewMutation = useMutation({
    mutationFn: async (videoId: number) => {
      await apiRequest("POST", `/api/videos/${videoId}/view`);
    },
  });

  const updateScoreMutation = useMutation({
    mutationFn: async (score: number) => {
      const response = await apiRequest("POST", `/api/users/${user?.id}/score`, { score });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
    },
  });

  const currentVideo = videos[currentVideoIndex];

  // Auto-scroll timer and quiz trigger logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeWatched(prev => prev + 1);
      
      // Trigger quiz after 2 minutes (120 seconds) or when reaching the 4th video (index 3)
      if (timeWatched >= 120 || currentVideoIndex >= 3) {
        setLocation("/quiz");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeWatched, currentVideoIndex, setLocation]);

  // Handle video completion
  const handleVideoComplete = () => {
    if (currentVideo) {
      incrementViewMutation.mutate(currentVideo.id);
      setVideosWatched(prev => prev + 1);
      updateScoreMutation.mutate(10); // Award 10 points for watching a video
      
      // Auto-advance to next video
      setTimeout(() => {
        nextVideo();
      }, 1000);
    }
  };

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent default scroll behavior during swipe
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    const diffY = touchStartY.current - touchEndY;
    const timeDiff = touchEndTime - touchStartTime.current;

    // Only register swipe if it's fast enough and long enough
    if (Math.abs(diffY) > 30 && timeDiff < 500) {
      if (diffY > 0) {
        // Swipe up - next video
        nextVideo();
      } else {
        // Swipe down - previous video
        previousVideo();
      }
    }
  };

  const nextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setSwipeDirection("up");
      setTimeout(() => {
        setCurrentVideoIndex(prev => prev + 1);
        setSwipeDirection(null);
      }, 150);
    }
  };

  const previousVideo = () => {
    if (currentVideoIndex > 0) {
      setSwipeDirection("down");
      setTimeout(() => {
        setCurrentVideoIndex(prev => prev - 1);
        setSwipeDirection(null);
      }, 150);
    }
  };

  // Keyboard navigation for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          previousVideo();
          break;
        case "ArrowDown":
          e.preventDefault();
          nextVideo();
          break;
        case "q":
          setLocation("/quiz");
          break;
        case "d":
          setLocation("/dashboard");
          break;
        case "l":
          setLocation("/leaderboard");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentVideoIndex, videos.length, setLocation]);

  const handleShare = async () => {
    if (navigator.share && currentVideo) {
      try {
        await navigator.share({
          title: currentVideo.title,
          text: currentVideo.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback for devices that don't support Web Share API
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Video link copied to clipboard",
        });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Video link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-center px-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">No videos available</h2>
          <p className="text-muted-foreground">Check back later for new content!</p>
        </div>
      </div>
    );
  }

  const progressPercent = Math.min(((currentVideoIndex + 1) / 4) * 100, 100);
  const timeUntilQuiz = Math.max(120 - timeWatched, 0);
  const videosUntilQuiz = Math.max(4 - (currentVideoIndex + 1), 0);

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full relative overflow-hidden touch-manipulation bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe indicators */}
      <AnimatePresence>
        {swipeDirection && (
          <motion.div
            initial={{ opacity: 0, y: swipeDirection === "up" ? 20 : -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`swipe-indicator ${swipeDirection === "up" ? "top" : "bottom"}`}
          >
            {swipeDirection === "up" ? "Next Video" : "Previous Video"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Player */}
      <VideoPlayer
        video={currentVideo}
        onVideoEnd={handleVideoComplete}
        className="absolute inset-0"
      />

      {/* Click areas for navigation on non-mobile devices */}
      <div className="absolute inset-0 z-10 hidden md:block pointer-events-none">
        {/* Previous video area (left half) */}
        <div 
          className="absolute left-0 top-0 w-1/2 h-full pointer-events-auto cursor-pointer"
          onClick={previousVideo}
        />
        {/* Next video area (right half) */}
        <div 
          className="absolute right-0 top-0 w-1/2 h-full pointer-events-auto cursor-pointer"
          onClick={nextVideo}
        />
      </div>



      {/* Video overlay gradient */}
      <div className="absolute inset-0 video-overlay pointer-events-none" />

      {/* Profile Icon - Top Right */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-3 sm:top-4 right-3 sm:right-4 z-50"
      >
        <Button
          onClick={() => setLocation("/profile")}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg border-2 border-white/20 text-xs sm:text-sm"
          size="icon"
        >
          {user?.name ? getUserInitials(user.name) : "U"}
        </Button>
      </motion.div>

      {/* Dynamic Island Progress Indicator */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-3 left-1/2 transform -translate-x-1/2 z-50 max-w-[90vw] sm:max-w-none"
      >
        <div className="bg-black/90 backdrop-blur-xl rounded-full px-3 sm:px-4 py-2 shadow-2xl border border-white/10">
          <div className="flex items-center space-x-2 sm:space-x-3 text-white text-xs sm:text-sm">
            {/* Progress Pills */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: 4 }, (_, i) => (
                <motion.div
                  key={i}
                  className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                    i < currentVideoIndex ? 'bg-green-400 shadow-sm shadow-green-400/50' : 
                    i === currentVideoIndex ? 'bg-blue-400 shadow-sm shadow-blue-400/50' : 
                    'bg-white/20'
                  }`}
                  animate={i === currentVideoIndex ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              ))}
            </div>
            
            {/* Quiz Challenge Badge */}
            {videosUntilQuiz > 0 ? (
              <div className="flex items-center space-x-1 sm:space-x-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-2 py-1 rounded-full border border-purple-400/30">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="text-yellow-400 text-xs sm:text-sm"
                >
                  🎯
                </motion.div>
                <span className="font-semibold text-white whitespace-nowrap">
                  {videosUntilQuiz} more to unlock quiz!
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-2 py-1 rounded-full border border-green-400/30">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-green-400 text-xs sm:text-sm"
                >
                  🚀
                </motion.div>
                <span className="font-semibold text-green-300 whitespace-nowrap">
                  Quiz ready!
                </span>
              </div>
            )}
            
            {/* Timer Display */}
            {timeUntilQuiz > 0 && timeUntilQuiz <= 30 && (
              <div className="flex items-center space-x-1 bg-orange-500/20 px-2 py-1 rounded-full border border-orange-400/30">
                <span className="text-orange-400 text-xs">⏰</span>
                <span className="font-mono text-orange-300 text-xs font-bold">
                  {timeUntilQuiz}s
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>





      {/* Side Action Buttons */}
      <div className="absolute right-2 sm:right-4 bottom-24 sm:bottom-32 flex flex-col space-y-4 sm:space-y-6 z-20">
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="text-center"
        >
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 sm:w-12 sm:h-12 glass-dark rounded-full text-white hover:bg-white/30"
          >
            <Heart className="w-4 h-4 sm:w-6 sm:h-6" />
          </Button>
          <span className="text-xs mt-1 block text-white">{currentVideo.likes}</span>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.9 }}
          className="text-center"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="w-10 h-10 sm:w-12 sm:h-12 glass-dark rounded-full text-white hover:bg-white/30"
          >
            <Share className="w-4 h-4 sm:w-6 sm:h-6" />
          </Button>
          <span className="text-xs mt-1 block text-white">Share</span>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 sm:w-12 sm:h-12 glass-dark rounded-full text-white hover:bg-white/30"
          >
            <Bookmark className="w-4 h-4 sm:w-6 sm:h-6" />
          </Button>
        </motion.div>
      </div>

      {/* Video Info */}
      <div className="absolute bottom-16 sm:bottom-20 left-2 sm:left-4 right-16 sm:right-20 z-20">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-xs sm:text-sm font-bold text-white">
              {currentVideo.subjectId === 1 ? "🧪" : 
               currentVideo.subjectId === 2 ? "📐" : 
               currentVideo.subjectId === 3 ? "📚" : "🔬"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm sm:text-base truncate">{currentVideo.title}</h3>
            <p className="text-xs sm:text-sm text-white/80 truncate">{currentVideo.createdBy}</p>
          </div>
        </div>
        
        <p className="text-xs sm:text-sm mb-2 sm:mb-3 text-white line-clamp-2">{currentVideo.description}</p>
      </div>

      {/* Video progress bar */}
      <div className="absolute bottom-16 left-0 right-0 h-1 bg-white/20 z-20">
        <div 
          className="h-full bg-accent progress-bar"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage="feed" />
    </div>
  );
}
