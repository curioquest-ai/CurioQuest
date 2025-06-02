import { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Video } from "@shared/schema";

interface VideoPlayerProps {
  video: Video;
  onVideoEnd?: () => void;
  className?: string;
}

export default function VideoPlayer({ video, onVideoEnd, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const progress = (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(progress);
    };

    const handleEnded = () => {
      onVideoEnd?.();
    };

    const handleError = (e: Event) => {
      console.log("Video error handled:", e);
      // For demo purposes, simulate video progress
      setTimeout(() => onVideoEnd?.(), 5000);
    };

    const handleLoadedData = () => {
      // Auto-play video when loaded
      videoElement.play().catch((error) => {
        console.log("Autoplay prevented:", error);
        // Fallback: simulate video playing
        setIsPlaying(true);
      });
    };

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("error", handleError);
    videoElement.addEventListener("loadeddata", handleLoadedData);

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("ended", handleEnded);
      videoElement.removeEventListener("error", handleError);
      videoElement.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [video.id, onVideoEnd]);

  const togglePlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoClick = () => {
    setShowControls(true);
    setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={video.videoUrl}
        playsInline
        loop={false}
        muted={isMuted}
        controls={false}
        preload="metadata"
        onClick={handleVideoClick}
        poster={video.thumbnailUrl}
      >
        <source src={video.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Fallback image if video fails */}
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: 'none' }}
        onError={() => {
          // Show thumbnail if video fails
          const img = document.querySelector(`img[alt="${video.title}"]`) as HTMLImageElement;
          if (img) img.style.display = 'block';
        }}
      />

      {/* Video Controls Overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="w-16 h-16 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 rounded-full"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="w-12 h-12 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 rounded-full"
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div 
          className="h-full bg-accent transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>



      {/* Click area for play/pause */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={handleVideoClick}
        onDoubleClick={togglePlayPause}
      />
    </div>
  );
}
