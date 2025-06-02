import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share, Bookmark, ChartLine, Trophy, Home, PieChart, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
      
      // Trigger quiz after 5 minutes (300 seconds) or 10 videos
      if (timeWatched >= 300 || videosWatched >= 10) {
        setLocation("/quiz");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeWatched, videosWatched, setLocation]);

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

  const progressPercent = Math.min((videosWatched / 10) * 100, 100);
  const timeUntilQuiz = Math.max(300 - timeWatched, 0);
  const videosUntilQuiz = Math.max(10 - videosWatched, 0);

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





      {/* Side Action Buttons */}
      <div className="absolute right-4 bottom-32 flex flex-col space-y-6 z-20">
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="text-center"
        >
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 glass-dark rounded-full text-white hover:bg-white/30"
          >
            <Heart className="w-6 h-6" />
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
            className="w-12 h-12 glass-dark rounded-full text-white hover:bg-white/30"
          >
            <Share className="w-6 h-6" />
          </Button>
          <span className="text-xs mt-1 block text-white">Share</span>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 glass-dark rounded-full text-white hover:bg-white/30"
          >
            <Bookmark className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>

      {/* Video Info */}
      <div className="absolute bottom-20 left-4 right-20 z-20">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {currentVideo.subjectId === 1 ? "🧪" : 
               currentVideo.subjectId === 2 ? "📐" : 
               currentVideo.subjectId === 3 ? "📚" : "🔬"}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{currentVideo.title}</h3>
            <p className="text-sm text-white/80">{currentVideo.createdBy}</p>
          </div>
        </div>
        
        <p className="text-sm mb-3 text-white">{currentVideo.description}</p>
        
        {/* Progress indicators */}
        <div className="flex items-center space-x-2 text-xs text-white/70">
          <span>Video {currentVideoIndex + 1}/{videos.length}</span>
          <span>•</span>
          <span>Quiz in {videosUntilQuiz} videos</span>
          {timeUntilQuiz > 0 && (
            <>
              <span>•</span>
              <span>{Math.floor(timeUntilQuiz / 60)}:{(timeUntilQuiz % 60).toString().padStart(2, '0')}</span>
            </>
          )}
        </div>
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
