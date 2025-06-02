import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakIndicatorProps {
  streak: number;
}

export default function StreakIndicator({ streak }: StreakIndicatorProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="flex items-center space-x-2"
    >
      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center relative">
        <span className="text-xs font-bold text-accent-foreground">{streak}</span>
        {streak > 0 && (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-1 -right-1"
          >
            <Flame className="w-4 h-4 text-orange-500" />
          </motion.div>
        )}
      </div>
      
      {streak > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden sm:block"
        >
          <span className="text-white text-sm font-medium">
            {streak} day{streak !== 1 ? 's' : ''} streak!
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
