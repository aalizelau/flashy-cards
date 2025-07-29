import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Flashcard } from './FlashcardApp';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TestTube, BarChart3, Brain, Zap, Trophy, Star } from 'lucide-react';
import ProgressDots from './ProgressDots';

interface FlashcardProgress {
  id: string;
  correctAnswers: number;
  totalAttempts: number;
  lastAttempted?: Date;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered';
}

interface BrowserModeProps {
  flashcards: Flashcard[];
  onStartTest: () => void;
  onViewReview: () => void;
}

export const BrowserMode: React.FC<BrowserModeProps> = ({ 
  flashcards, 
  onStartTest, 
  onViewReview 
}) => {
  // Mock progress data - in a real app, this would come from persistent storage
  const [progressData] = useState<FlashcardProgress[]>(() => 
    flashcards.map((card, index) => ({
      id: card.id,
      correctAnswers: Math.floor(Math.random() * 10),
      totalAttempts: Math.floor(Math.random() * 15) + 1,
      lastAttempted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      proficiencyLevel: ['beginner', 'intermediate', 'advanced', 'mastered'][Math.floor(Math.random() * 4)] as any
    }))
  );

  const getProgressPercentage = (progress: FlashcardProgress): number => {
    return Math.round((progress.correctAnswers / progress.totalAttempts) * 100);
  };

  const getProficiencyIcon = (level: string) => {
    switch (level) {
      case 'mastered': return <Trophy className="w-4 h-4 text-success" />;
      case 'advanced': return <Star className="w-4 h-4 text-warning" />;
      case 'intermediate': return <Zap className="w-4 h-4 text-accent" />;
      default: return <Brain className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'mastered': return 'text-success';
      case 'advanced': return 'text-warning';
      case 'intermediate': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-success';
    if (percentage >= 70) return 'bg-warning';
    if (percentage >= 50) return 'bg-accent';
    return 'bg-muted-foreground';
  };

  // Statistics
  const totalWords = flashcards.length;
  const masteredWords = progressData.filter(p => p.proficiencyLevel === 'mastered').length;
  const averageProgress = Math.round(
    progressData.reduce((sum, p) => sum + getProgressPercentage(p), 0) / totalWords
  );
  // New stats
  const wordsRemembered = progressData.filter(p => p.correctAnswers > 0).length;
  const timesRemembered = progressData.reduce((sum, p) => sum + p.correctAnswers, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Flashcard Browser</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Browse your flashcard collection and track learning progress
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totalWords}</div>
                <div className="text-sm text-muted-foreground">Total Words</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/10 rounded-lg">
                <Trophy className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{masteredWords}</div>
                <div className="text-sm text-muted-foreground">Mastered</div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Times Remembered (total count) */}
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Zap className="w-6 h-6 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">{timesRemembered}</div>
                <div className="text-sm text-muted-foreground">Times Remembered</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{averageProgress}%</div>
                <div className="text-sm text-muted-foreground">Avg. Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/20 shadow-card hover:scale-105 transform transition-all cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
              <TestTube className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Start Test on All</h3>
            <p className="text-sm text-muted-foreground">Test yourself on all flashcards</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/20 to-accent/10 border-accent/20 shadow-card hover:scale-105 transform transition-all cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-accent/10 rounded-full w-fit mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Start Test on Specific Chapter</h3>
            <p className="text-sm text-muted-foreground">Focus on a particular chapter</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/20 to-warning/10 border-warning/20 shadow-card hover:scale-105 transform transition-all cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-warning/10 rounded-full w-fit mx-auto mb-4">
              <Brain className="w-6 h-6 text-warning" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Start Test on Unfamiliar Words</h3>
            <p className="text-sm text-muted-foreground">Review words you struggle with</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/20 to-success/10 border-success/20 shadow-card hover:scale-105 transform transition-all cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-success/10 rounded-full w-fit mx-auto mb-4">
              <Star className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Start Test on Newly Added Words</h3>
            <p className="text-sm text-muted-foreground">Practice your newest flashcards</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mb-8">
        <Button 
          onClick={onStartTest}
          size="lg"
          className="bg-gradient-primary hover:scale-105 transform transition-all"
        >
          <TestTube className="mr-2" />
          Start Test
        </Button>
        <Button 
          onClick={onViewReview}
          variant="outline"
          size="lg"
          className="hover:scale-105 transform transition-all"
        >
          <BarChart3 className="mr-2" />
          View Last Results
        </Button>
      </div>
    </div>
  );
};