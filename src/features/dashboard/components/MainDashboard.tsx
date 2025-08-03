
import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { 
  Rocket, 
  Plus, 
  BookOpen, 
  Target, 
  Brain,
  ArrowRight
} from 'lucide-react';
import { TestAnalytics } from '@/shared/types/api';
import { StatisticsPanel } from './StatisticsPanel';

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
      <div className="flex-1 px-8 py-12 max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="bg-muted rounded-3xl p-8 relative overflow-hidden border border-border">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Welcome Back Alize!
              </h1>
              <p className="text-lg text-muted-foreground">
                You've learned 80% of words this week.<br />
                Keep it up to improve your results.
              </p>
            </div>
            
            {/* Illustration placeholder */}
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <div className="flex space-x-3">
                <div className="w-12 h-16 bg-test-newly rounded-lg"></div>
                <div className="w-12 h-16 bg-test-chapters rounded-lg"></div>
                <div className="w-12 h-16 bg-muted-foreground/20 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Statistics */}
        <StatisticsPanel analytics={analytics} />

        {/* Start Practice Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Start Practice</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Daily Challenges - Large card */}
            <Card 
              className={`bg-daily-challenges hover:scale-105 transform transition-all cursor-pointer col-span-1 row-span-2`}
              onClick={onStartTest}
            >
              <CardContent className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-daily-challenges-foreground/10 rounded-full">
                      <Rocket className="w-6 h-6 text-daily-challenges-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-daily-challenges-foreground">
                      Daily Challenges
                    </h3>
                  </div>
                  <p className="text-daily-challenges-foreground/70 mb-6">
                    Random set each day. Maybe 5-10 words, mixed difficulty.
                  </p>
                </div>
                <div className="flex justify-end">
                  <div className="p-2 bg-daily-challenges-foreground/20 rounded-full">
                    <ArrowRight className="w-5 h-5 text-daily-challenges-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Newly Added */}
            <Card 
              className="bg-test-newly hover:scale-105 transform transition-all cursor-pointer"
              onClick={onStartTest}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-test-newly-foreground/10 rounded-full">
                    <Plus className="w-6 h-6 text-test-newly-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-test-newly-foreground">
                    Test Newly Added
                  </h3>
                </div>
                <div className="p-2 bg-test-newly-foreground/20 rounded-full">
                  <ArrowRight className="w-5 h-5 text-test-newly-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Test By Chapters */}
            <Card 
              className="bg-test-chapters hover:scale-105 transform transition-all cursor-pointer"
              onClick={onStartTest}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-test-chapters-foreground/10 rounded-full">
                    <BookOpen className="w-6 h-6 text-test-chapters-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-test-chapters-foreground">
                    Test By Chapters
                  </h3>
                </div>
               <div className="p-2 bg-test-chapters-foreground/20 rounded-full">
                  <ArrowRight className="w-5 h-5 text-test-chapters-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Test All Words */}
            <Card 
              className="bg-test-all hover:scale-105 transform transition-all cursor-pointer"
              onClick={onStartTest}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-test-all-foreground/10 rounded-full">
                    <Target className="w-6 h-6 text-test-all-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-test-all-foreground">
                    Test All Words
                  </h3>
                </div>
                 <div className="p-2 bg-test-all-foreground/20 rounded-full">
                  <ArrowRight className="w-5 h-5 text-test-all-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Test Unfamiliar */}
            <Card 
              className="bg-test-unfamiliar hover:scale-105 transform transition-all cursor-pointer"
              onClick={onStartTest}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-test-unfamiliar-foreground/10 rounded-full">
                    <Brain className="w-6 h-6 text-test-unfamiliar-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-test-unfamiliar-foreground">
                    Test Unfamiliar
                  </h3>
                </div>
                <div className="p-2 bg-test-unfamiliar-foreground/20 rounded-full">
                  <ArrowRight className="w-5 h-5 text-test-unfamiliar-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};