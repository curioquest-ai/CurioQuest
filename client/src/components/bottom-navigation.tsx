import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Trophy, PieChart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
  currentPage: "feed" | "leaderboard" | "dashboard" | "ai-teacher";
}

const navigationItems = [
  { id: "feed", label: "Home", icon: Home, path: "/feed" },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
  { id: "dashboard", label: "Progress", icon: PieChart, path: "/dashboard" },
  { id: "ai-teacher", label: "AI Teacher", icon: MessageCircle, path: "/ai-teacher" },
];

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 to-black/70 backdrop-blur-sm pt-4 pb-safe">
      <div className="flex justify-around items-center px-4 pb-2">
        {navigationItems.map((item) => {
          const isActive = item.id === currentPage;
          const IconComponent = item.icon;
          
          return (
            <motion.div
              key={item.id}
              whileTap={{ scale: 0.9 }}
              className="relative"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 ${
                  isActive ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <div className="relative">
                  <IconComponent className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
                <span className="text-xs">{item.label}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
