
import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { 
  Rocket, 
  Plus, 
  BookOpen, 
  Target, 
  Brain,
  ArrowRight,
  MousePointerClick, 
  Sparkles,
  WalletCards,
  Swords
} from 'lucide-react';
import { TestAnalytics } from '@/shared/types/api';
import { StatisticsPanel } from './StatisticsPanel';
import Arts from '@/assets/arts.png';

interface MainDashboardProps {
  onStartTest: () => void;
  analytics?: TestAnalytics;
}


export const MainDashboard: React.FC<MainDashboardProps> = ({ 
  onStartTest, 
  analytics
}) => {

  return (
    <div className="min-h-screen bg-gradient-bg flex">

      {/* Main content */}
      <div className="flex-1 px-8 py-12 max-w-4xl mx-auto mt-6">
        {/* Welcome Section */}
        <div className="mb-12 relative">
          {/* Image background flourish */}
     {/* <img
      src={Arts}
      alt="Decorative leaves"
      className="absolute -bottom-10 right-10 z-10 scale-90 opacity-70 sm:w-56  pointer-events-none"
    /> */}
  
  
  <div className="bg-muted rounded-3xl z-4 p-8 relative overflow-hidden border border-border">
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
      <h1 className="text-3xl font-bold text-darkest-blue mb-4">
        Welcome Back Alize!
      </h1>
      <p className="text-lg text-muted-foreground max-w-lg">
        You've learned 80% of words this week. 
        Keep it up to improve your results.
      </p>
    </div>
            
            {/* Illustration placeholder */}
            {/* <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <div className="flex space-x-3">
                <div className="w-12 h-16 bg-test-newly rounded-lg"></div>
                <div className="w-12 h-16 bg-test-chapters rounded-lg"></div>
                <div className="w-12 h-16 bg-muted-foreground/20 rounded-lg"></div>
              </div>
            </div> */}
          </div>
        </div>
        {/* Statistics */}
        <StatisticsPanel analytics={analytics} />

        {/* Start Practice Section */}
        <div className="mb-8">
          {/* <h2 className="text-2xl font-bold text-darkest-blue mb-6">Start Practice</h2> */}
          
          <div className="grid grid-cols-2 gap-4">
            {/* Daily Challenges - Large card */}
            <Card 
              className={`bg-home-light-gray hover:scale-105 transform transition-all cursor-pointer col-span-1 row-span-2`}
              onClick={onStartTest}
            >
              <CardContent className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-main-secondary rounded-full">
                      <Rocket className="w-6 h-6 text-main-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-main-foreground">
                      Daily Challenges
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Random set each day. Maybe 5-10 words, mixed difficulty.
                  </p>
                </div>
                <div className="flex justify-end">
                  <div className="p-2 bg-main-secondary rounded-full shadow-custom-dark">
                    <ArrowRight className="w-5 h-5 text-main-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Newly Added */}
            <Card 
              className="bg-home-gray-neutral hover:scale-105 transform transition-all cursor-pointer"
              onClick={onStartTest}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-main-dark-gray rounded-full">
                    <Sparkles className="w-6 h-6 text-main-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-main-foreground">
                    Test Newly Added
                  </h3>
                </div>
                <div className="p-2 bg-main-dark-gray rounded-full shadow-custom-dark">
                  <ArrowRight className="w-5 h-5 text-main-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Test By Chapters */}
            <Card 
              className="bg-home-gray-beige hover:scale-105 transform transition-all cursor-pointer"
              onClick={onStartTest}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-main-primary rounded-full">
                    <WalletCards className="w-6 h-6 text-main-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-main-foreground">
                    Test By Decks
                  </h3>
                </div>
               <div className="p-2 bg-main-dark-gray rounded-full shadow-custom-dark">
                  <ArrowRight className="w-5 h-5 text-main-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Test All Words */}
            <Card 
              className="bg-home-gray-green hover:scale-105 transform transition-all cursor-pointer"
              onClick={onStartTest}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-main-secondary rounded-full">
                    <Swords className="w-6 h-6 text-main-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-main-foreground">
                    Test All Words
                  </h3>
                </div>
                 <div className="p-2 bg-main-secondary rounded-full shadow-custom-dark">
                  <ArrowRight className="w-5 h-5 text-main-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Test Unfamiliar */}
            <Card 
              className="bg-main-secondary hover:scale-105 transform transition-all cursor-pointer"
              onClick={onStartTest}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-main-dark-gray rounded-full">
                    <MousePointerClick className="w-6 h-6 text-main-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-main-foreground">
                    Test Unfamiliar
                  </h3>
                </div>
                <div className="p-2 bg-main-dark-gray rounded-full shadow-custom-dark">
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