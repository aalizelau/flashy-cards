import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from "@/shared/components/ui/card";
import { PartyPopper } from "lucide-react";

export default function Onboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const { completeOnboarding, user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    setIsLoading(true);
    
    // Simulate a brief loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    completeOnboarding();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
      <div className="shadow-card">
      <Card className="bg-muted rounded-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="w-8 h-8 text-main-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-main-foreground mb-2">
            Welcome to Flashy Cards!
          </h1>
          <p className="text-muted-foreground">
            Ready to start your journey?
          </p>
        </div>

        <div className="mb-8 space-y-4 text-left">
          <Card className="p-6 bg-gray-50 shadow-[var(--shadow-card)] space-y-6">
            <div className="flex items-start gap-4">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-semibold">1</span>
            </div>
              <div className="space-y-1 text-left">
                <h3 className="font-medium text-foreground">Browse & Create Flashcards</h3>
                <p className="text-sm text-muted-foreground">
                  Organize your study materials into decks
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 text-sm font-semibold">2</span>
            </div>
              <div className="space-y-1 text-left">
                <h3 className="font-medium text-foreground">Study & Test Yourself</h3>
                <p className="text-sm text-muted-foreground">
                  Multiple study modes to choose
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-600 text-sm font-semibold">3</span>
            </div>
              <div className="space-y-1 text-left">
                <h3 className="font-medium text-foreground">Track Your Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Analytics to help you improve
                </p>
              </div>
            </div>
          </Card>
        </div>

        <button
          onClick={handleGetStarted}
          disabled={isLoading}
          className="w-full bg-muted-foreground hover:bg-main-foreground disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? 'Setting things up...' : 'Get Started'}
        </button>
      </Card>
      </div>
    </div>
  );
}