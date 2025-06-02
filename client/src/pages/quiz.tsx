import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Clock, CheckCircle, XCircle, Trophy, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Quiz } from "@shared/schema";

export default function Quiz() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["/api/quiz/random"],
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (answerData: {
      userId: number;
      quizId: number;
      selectedAnswer: number;
      isCorrect: boolean;
      pointsEarned: number;
    }) => {
      const response = await apiRequest("POST", "/api/quiz/attempt", answerData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.newAchievements && data.newAchievements.length > 0) {
        toast({
          title: "New Achievement!",
          description: `You've earned ${data.newAchievements.length} new achievement(s)!`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
    },
  });

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isAnswerRevealed && !quizComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswerRevealed) {
      // Time's up - auto submit with no answer
      handleSubmit();
    }
  }, [timeLeft, isAnswerRevealed, quizComplete]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswerRevealed) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (!quiz || !user) return;

    const isCorrect = selectedAnswer === quiz.correctAnswer;
    const points = isCorrect ? Math.max(10, timeLeft) : 0; // More points for faster answers

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    setScore(prev => prev + points);
    setIsAnswerRevealed(true);

    submitAnswerMutation.mutate({
      userId: user.id,
      quizId: quiz.id,
      selectedAnswer: selectedAnswer ?? -1,
      isCorrect,
      pointsEarned: points,
    });

    // Show result for 3 seconds then continue
    setTimeout(() => {
      if (currentQuestionIndex < 2) { // 3 questions total
        nextQuestion();
      } else {
        completeQuiz();
      }
    }, 3000);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setTimeLeft(30);
    setIsAnswerRevealed(false);
    queryClient.invalidateQueries({ queryKey: ["/api/quiz/random"] });
  };

  const completeQuiz = () => {
    setQuizComplete(true);
    
    // Show completion message and redirect after delay
    setTimeout(() => {
      setLocation("/feed");
    }, 4000);
  };

  const handleSkipQuiz = () => {
    setLocation("/feed");
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full gradient-primary flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="h-screen w-full gradient-primary flex flex-col items-center justify-center px-6">
        <div className="text-center text-white mb-6">
          <Brain className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Quiz Available</h2>
          <p className="text-white/90">Try again later!</p>
        </div>
        <Button
          onClick={() => setLocation("/feed")}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Back to Videos
        </Button>
      </div>
    );
  }

  if (quizComplete) {
    return (
      <div className="h-screen w-full gradient-primary flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center text-white"
        >
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-accent-foreground" />
          </div>
          
          <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-xl text-white/90 mb-6">
            You scored {correctAnswers}/3 correct answers
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent mb-2">+{score} points</p>
              <p className="text-white/80">Added to your total score</p>
            </div>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/70"
          >
            Returning to video feed...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const progressPercentage = ((currentQuestionIndex + 1) / 3) * 100;

  return (
    <div className="h-screen w-full gradient-primary flex flex-col px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Brain className="w-8 h-8 text-accent-foreground" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Quiz Time!</h2>
        <p className="text-white/90">Test your knowledge</p>
      </div>

      {/* Progress and Timer */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white/80">
            Question {currentQuestionIndex + 1} of 3
          </span>
          <div className="flex items-center space-x-2 text-white/80">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">
              {timeLeft}s
            </span>
          </div>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-white/20"
        />
      </div>

      {/* Question Card */}
      <motion.div
        key={quiz.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 flex-1 flex flex-col"
      >
        <h3 className="text-lg font-semibold text-white mb-6 leading-relaxed">
          {quiz.question}
        </h3>
        
        <div className="space-y-3 flex-1">
          {quiz.options.map((option, index) => {
            let buttonClass = "w-full p-4 rounded-xl text-left transition-all duration-200 ";
            
            if (isAnswerRevealed) {
              if (index === quiz.correctAnswer) {
                buttonClass += "bg-success text-white border-2 border-success";
              } else if (index === selectedAnswer && selectedAnswer !== quiz.correctAnswer) {
                buttonClass += "bg-destructive text-white border-2 border-destructive";
              } else {
                buttonClass += "bg-white/20 text-white/60 border border-white/30";
              }
            } else {
              if (selectedAnswer === index) {
                buttonClass += "bg-accent text-accent-foreground border-2 border-accent";
              } else {
                buttonClass += "bg-white/20 text-white hover:bg-white/30 border border-white/30";
              }
            }

            return (
              <motion.button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswerRevealed}
                className={buttonClass}
                whileTap={!isAnswerRevealed ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {isAnswerRevealed && (
                    <div className="ml-2">
                      {index === quiz.correctAnswer ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : index === selectedAnswer ? (
                        <XCircle className="w-5 h-5" />
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Answer explanation */}
        <AnimatePresence>
          {isAnswerRevealed && quiz.explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-white/10 rounded-xl"
            >
              <p className="text-sm text-white/90">
                <strong>Explanation:</strong> {quiz.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {!isAnswerRevealed ? (
          <div className="flex space-x-3">
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswer === null || submitAnswerMutation.isPending}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
            >
              {submitAnswerMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Submit Answer</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
            
            <Button
              onClick={handleSkipQuiz}
              variant="outline"
              className="px-6 border-white/30 text-white hover:bg-white/20"
            >
              Skip
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-white/80 text-sm">
              {currentQuestionIndex < 2 ? 
                "Next question in 3 seconds..." : 
                "Completing quiz..."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
