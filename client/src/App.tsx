import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth.tsx";
import { useAuth } from "@/hooks/use-auth";

import Onboarding from "@/pages/onboarding";
import VideoFeed from "@/pages/video-feed";
import Quiz from "@/pages/quiz";
import Dashboard from "@/pages/dashboard";
import Leaderboard from "@/pages/leaderboard";
import NotFound from "@/pages/not-found";

function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={user ? VideoFeed : Onboarding} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/feed" component={VideoFeed} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="h-screen w-full overflow-hidden bg-background text-foreground font-sans">
            <Toaster />
            <AppRouter />
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
