import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Flame, Medal, Zap, Trophy, Calculator, Book, FlaskRound, Atom, Dna, ChevronRight, ChevronDown, Play, CheckCircle, Lock, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

// Generate realistic chapter data for each subject
const generateChapters = (subjectName: string, totalChapters: number, completedChapters: number) => {
  const chapterData: Record<string, string[]> = {
    Chemistry: [
      "Atomic Structure", "Chemical Bonding", "Periodic Table", "Chemical Reactions", 
      "Acids and Bases", "Organic Chemistry", "Thermodynamics", "Kinetics", 
      "Electrochemistry", "Nuclear Chemistry", "Environmental Chemistry", "Biochemistry"
    ],
    Mathematics: [
      "Algebra Fundamentals", "Linear Equations", "Quadratic Functions", "Trigonometry", 
      "Calculus Introduction", "Derivatives", "Integrals", "Statistics", "Probability", "Geometry"
    ],
    English: [
      "Grammar Basics", "Reading Comprehension", "Creative Writing", "Poetry Analysis", 
      "Essay Writing", "Literature Study", "Public Speaking", "Critical Thinking"
    ],
    Physics: [
      "Mechanics", "Thermodynamics", "Waves and Sound", "Electricity", "Magnetism", 
      "Optics", "Modern Physics", "Quantum Mechanics", "Relativity", "Nuclear Physics", 
      "Particle Physics", "Astrophysics", "Fluid Dynamics", "Solid State Physics", "Electronics"
    ],
    Biology: [
      "Cell Biology", "Genetics", "Evolution", "Ecology", "Human Anatomy", "Physiology", 
      "Microbiology", "Botany", "Zoology", "Biochemistry", "Molecular Biology", 
      "Biotechnology", "Environmental Biology", "Marine Biology"
    ]
  };

  const descriptions: Record<string, string[]> = {
    Chemistry: [
      "Learn about atoms, electrons, and molecular structure",
      "Understand how atoms bond to form compounds",
      "Explore the organization of chemical elements",
      "Study different types of chemical reactions",
      "Master pH, acids, bases, and neutralization",
      "Discover carbon-based molecular compounds",
      "Explore energy changes in chemical reactions",
      "Understand reaction rates and mechanisms",
      "Study electrical energy in chemical systems",
      "Learn about radioactive elements and reactions",
      "Explore chemistry's impact on our environment",
      "Understand the chemistry of living organisms"
    ],
    Mathematics: [
      "Master variables, expressions, and equations",
      "Solve systems of linear equations",
      "Work with parabolas and quadratic formulas",
      "Study angles, triangles, and circular functions",
      "Introduction to limits and derivatives",
      "Learn rates of change and optimization",
      "Master area under curves and applications",
      "Analyze data and measures of central tendency",
      "Calculate likelihood and random events",
      "Study shapes, angles, and spatial relationships"
    ],
    English: [
      "Master sentence structure and parts of speech",
      "Develop skills in understanding complex texts",
      "Express ideas through narrative and descriptive writing",
      "Analyze literary devices and poetic forms",
      "Structure arguments and persuasive writing",
      "Explore classic and contemporary literature",
      "Build confidence in oral communication",
      "Develop analytical and reasoning skills"
    ],
    Physics: [
      "Study motion, forces, and energy",
      "Understand heat, temperature, and energy transfer",
      "Explore sound, light, and wave properties",
      "Learn about electric charges and circuits",
      "Study magnetic fields and electromagnetic induction",
      "Understand lenses, mirrors, and light behavior",
      "Explore atomic structure and quantum theory",
      "Learn about quantum mechanics principles",
      "Study Einstein's theories of relativity",
      "Understand atomic nuclei and radioactivity",
      "Explore fundamental particles and forces",
      "Study stars, galaxies, and cosmic phenomena",
      "Learn about liquids, gases, and flow",
      "Study crystalline structures and materials",
      "Understand circuits and electronic devices"
    ],
    Biology: [
      "Study cell structure and organelles",
      "Learn about DNA, inheritance, and traits",
      "Understand natural selection and adaptation",
      "Explore ecosystems and environmental interactions",
      "Study human body systems and structure",
      "Learn how organs and systems function",
      "Explore bacteria, viruses, and microorganisms",
      "Study plant structure, growth, and reproduction",
      "Learn about animal behavior and classification",
      "Understand chemical processes in living things",
      "Study DNA, RNA, and protein synthesis",
      "Explore genetic engineering and applications",
      "Learn about conservation and sustainability",
      "Study ocean life and marine ecosystems"
    ]
  };

  const subjectChapters = chapterData[subjectName] || [];
  const subjectDescriptions = descriptions[subjectName] || [];
  
  return Array.from({ length: totalChapters }, (_, index) => ({
    title: subjectChapters[index] || `Chapter ${index + 1}`,
    description: subjectDescriptions[index] || `Learn important concepts in ${subjectName.toLowerCase()}`
  }));
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "progress"],
    enabled: !!user?.id,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
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



        {/* Subject Progress Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Learning Journey</h2>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Keep it up!</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {(progress.length > 0 ? progress : subjects.map(subject => ({
              subject,
              completedTopics: Math.floor(Math.random() * subject.totalTopics),
              userId: user?.id,
              subjectId: subject.id,
              id: subject.id,
              lastAccessed: new Date()
            }))).map((item, index) => {
              const IconComponent = subjectIcons[item.subject.icon as keyof typeof subjectIcons] || Book;
              const percentage = Math.round((item.completedTopics / item.subject.totalTopics) * 100);
              const chapters = generateChapters(item.subject.name, item.subject.totalTopics, item.completedTopics);
              
              return (
                <motion.div
                  key={item.subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Collapsible>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                      <CardContent className="p-0">
                        {/* Subject Header - Collapsible Trigger */}
                        <CollapsibleTrigger className="w-full">
                          <div 
                            className="p-6 text-white relative overflow-hidden cursor-pointer hover:brightness-110 transition-all duration-200"
                            style={{ 
                              background: `linear-gradient(135deg, ${item.subject.color} 0%, ${item.subject.color}cc 100%)` 
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                  <IconComponent className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                  <h3 className="text-xl font-bold">{item.subject.name}</h3>
                                  <p className="text-white/80 text-sm">
                                    {item.completedTopics} of {item.subject.totalTopics} chapters completed
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="text-right">
                                  <div className="text-2xl font-bold">{percentage}%</div>
                                  <div className="text-white/80 text-sm">Complete</div>
                                </div>
                                <ChevronDown className="w-5 h-5 text-white/80 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-4 relative">
                              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-white rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                                />
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        {/* Chapter List - Collapsible Content */}
                        <CollapsibleContent>
                          <div className="p-6 pt-4 border-t border-border/50">
                            <div className="space-y-3">
                              {chapters.map((chapter, chapterIndex) => {
                                const isCompleted = chapterIndex < item.completedTopics;
                                const isCurrent = chapterIndex === item.completedTopics;
                                const isLocked = chapterIndex > item.completedTopics;
                                
                                return (
                                  <motion.div
                                    key={chapterIndex}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + chapterIndex * 0.05 }}
                                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                                      isCompleted 
                                        ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' 
                                        : isCurrent 
                                        ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 ring-1 ring-blue-300 dark:ring-blue-700' 
                                        : 'bg-muted/50 border border-border'
                                    } ${isCurrent ? 'shadow-sm' : ''}`}
                                  >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      isCompleted 
                                        ? 'bg-green-500 text-white' 
                                        : isCurrent 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-muted text-muted-foreground'
                                    }`}>
                                      {isCompleted ? (
                                        <CheckCircle className="w-4 h-4" />
                                      ) : isCurrent ? (
                                        <Play className="w-4 h-4" />
                                      ) : (
                                        <Lock className="w-4 h-4" />
                                      )}
                                    </div>
                                    
                                    <div className="flex-1">
                                      <p className={`font-medium ${
                                        isCompleted 
                                          ? 'text-green-700 dark:text-green-300' 
                                          : isCurrent 
                                          ? 'text-blue-700 dark:text-blue-300' 
                                          : 'text-muted-foreground'
                                      }`}>
                                        Chapter {chapterIndex + 1}: {chapter.title}
                                      </p>
                                      <p className={`text-sm ${
                                        isCompleted 
                                          ? 'text-green-600 dark:text-green-400' 
                                          : isCurrent 
                                          ? 'text-blue-600 dark:text-blue-400' 
                                          : 'text-muted-foreground/70'
                                      }`}>
                                        {chapter.description}
                                      </p>
                                    </div>
                                    
                                    {isCurrent && (
                                      <motion.div
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                      >
                                        <ChevronRight className="w-5 h-5 text-blue-500" />
                                      </motion.div>
                                    )}
                                    
                                    {isCompleted && (
                                      <div className="text-green-500 text-sm font-medium">
                                        ✓ Done
                                      </div>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>
                            
                            {percentage === 100 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg text-center"
                              >
                                <div className="flex items-center justify-center space-x-2 text-green-700 dark:text-green-300">
                                  <Trophy className="w-5 h-5" />
                                  <span className="font-semibold">Subject Complete!</span>
                                </div>
                                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                  Congratulations on mastering {item.subject.name}!
                                </p>
                              </motion.div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </CardContent>
                    </Card>
                  </Collapsible>
                </motion.div>
              );
            })}
          </div>
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
