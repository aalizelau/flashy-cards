
import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { 
  Rocket, 
  ArrowRight,
  MousePointerClick, 
  Sparkles,
  WalletCards,
  Swords
} from 'lucide-react';
import { TestAnalytics } from '@/shared/types/api';
import { StatisticsPanel } from './StatisticsPanel';
import Arts from '@/assets/arts.png';
import { useAuth } from '@/features/auth/contexts/AuthContext';

interface MainDashboardProps {
  onStartTest: (testType: string) => void;
  analytics?: TestAnalytics;
}


export const MainDashboard: React.FC<MainDashboardProps> = ({ 
  onStartTest, 
  analytics
}) => {
  const { user } = useAuth();
  
  // Get user display name, fallback to email or "User"
  const displayName = user?.displayName?.split(' ')[0]

  return (
    <div className="min-h-screen bg-gradient-bg flex">

      {/* Main content */}
      <div className="flex-1 px-8 py-12 max-w-4xl mx-auto mt-4">
        {/* Welcome Section */}
        <div className="mb-8 relative">
          {/* Image background flourish */}
  
  <div className="bg-muted rounded-3xl z-4 p-8 relative overflow-hidden border border-border shadow-card">
    <img
      src={Arts}
      alt="Decorative leaves"
      className="absolute -bottom-14 right-40 w-40 z-10 sm:w-56 opacity-10 rotate-0 pointer-events-none"
    />
        <img
      src={Arts}
      alt="Decorative leaves"
      className="absolute -bottom-14 right-0 w-40 z-10 sm:w-56 opacity-30 rotate-0 pointer-events-none"
    />
        <img
      src={Arts}
      alt="Decorative leaves"
      className="absolute -bottom-14 -right-20 w-40 z-10 sm:w-56 opacity-60 rotate-0 pointer-events-none"
    />
    {/* Text content */}
    <div className="relative z-8">
      <h1 className="text-4xl font-normal font-gloock text-main-foreground mb-4">
        Welcome Back, {displayName}!
      </h1>
      <p className="text-lg text-muted-foreground max-w-lg">
        You've learned 80% of words this week. 
        Keep it up to improve your results.
      </p>
    </div>
          </div>
        </div>
        {/* Statistics */}
        <StatisticsPanel analytics={analytics} />

        {/* Start Practice Section */}
        <div className="mb-8">
          
          <div className="grid grid-cols-2 gap-4">
            {/* Daily Challenges - Large card */}
            <Card 
              className={`bg-home-light-gray hover:scale-105 transform transition-all cursor-pointer col-span-1 row-span-2`}
              onClick={() => onStartTest('daily_challenge')}
            >
              <CardContent className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-8 mb-4">
                    <div className="p-3 bg-home-gray-beige-bg/40 rounded-full">
                      <Rocket className="w-6 h-6 text-main-foreground" />
                    </div>
                    <h3 className="text-4xl font-md text-main-foreground font-alumni-sans">
                      Daily Challenges
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Random set each day. Maybe 5-10 words, mixed difficulty.
                  </p>
                </div>
                <div className="flex justify-end">
                  <div className="p-2 rounded-full ">
                    <ArrowRight className="w-5 h-5 text-main-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Newly Added */}
            <Card 
              className="bg-home-gray-neutral hover:scale-105 transform transition-all cursor-pointer"
              onClick={() => onStartTest('test_newly_added')}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="p-3 bg-home-gray-neutral-bg rounded-full">
                    <Sparkles className="w-6 h-6 text-main-foreground" />
                  </div>
                  <h3 className="text-3xl font-md text-main-foreground font-alumni-sans">
                    Test Newly Added
                  </h3>
                </div>
                <div className="p-2 rounded-full">
                  <ArrowRight className="w-5 h-5 text-main-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Test By Chapters */}
            <Card 
              className="bg-home-gray-beige hover:scale-105 transform transition-all cursor-pointer"
              onClick={() => onStartTest('test_by_decks')}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="p-3 bg-home-gray-beige-bg rounded-full">
                    <WalletCards className="w-6 h-6 text-main-foreground" />
                  </div>
                  <h3 className="text-3xl font-md text-main-foreground font-alumni-sans">
                    Test By Decks
                  </h3>
                </div>
               <div className="p-2  rounded-full">
                  <ArrowRight className="w-5 h-5 text-main-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Test All Words */}
            <Card 
              className="bg-home-gray-green hover:scale-105 transform transition-all cursor-pointer"
              onClick={() => onStartTest('test_all')}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="p-3 bg-home-gray-green-bg rounded-full">
                    <Swords className="w-6 h-6 text-main-foreground" />
                  </div>
                  <h3 className="text-3xl font-md text-main-foreground font-alumni-sans">
                    Test All Words
                  </h3>
                </div>
                 <div className="p-2  rounded-full">
                  <ArrowRight className="w-5 h-5 text-main-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Test Unfamiliar */}
            <Card 
              className="bg-main-secondary hover:scale-105 transform transition-all cursor-pointer"
              onClick={() => onStartTest('test_unfamiliar')}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="p-3 bg-home-gray-blue-bg rounded-full">
                    <MousePointerClick className="w-6 h-6 text-main-foreground" />
                  </div>
                  <h3 className="text-3xl font-md text-main-foreground font-alumni-sans">
                    Test Unfamiliar
                  </h3>
                </div>
                <div className="p-2  rounded-full">
                  <ArrowRight className="w-5 h-5 text-main-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};