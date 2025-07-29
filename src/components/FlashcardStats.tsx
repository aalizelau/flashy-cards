import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Trophy, Zap, BarChart3 } from 'lucide-react';

export interface FlashcardStatsProps {
  totalWords: number;
  masteredWords: number;
  timesRemembered: number;
  averageProgress: number;
}

export const FlashcardStats: React.FC<FlashcardStatsProps> = ({
  totalWords,
  masteredWords,
  timesRemembered,
  averageProgress
}) => {
  return (
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
  );
};
