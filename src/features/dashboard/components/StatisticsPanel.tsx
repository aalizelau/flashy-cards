import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { BookOpen, Trophy, Zap, BarChart3 } from 'lucide-react';
import { TestAnalytics } from '@/shared/types/api';

export interface StatisticsPanelProps {
  analytics?: TestAnalytics;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  analytics
}) => {
  const totalWords = analytics?.total_cards_studied || 0;
  const masteredWords = analytics?.cards_mastered || 0;
  const averageProgress = Math.round((analytics?.overall_average_progress || 0) * 100);
  const timesRemembered = analytics?.total_correct_answers || 0;
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
              <div className="text-sm text-muted-foreground">Words Studied</div>
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
              <div className="text-sm text-muted-foreground">Words Mastered</div>
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
