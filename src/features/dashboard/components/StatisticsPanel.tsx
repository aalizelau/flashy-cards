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
            <div className="p-3 bg-studied/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-studied" />
            </div>
            <div>
              <div className="text-2xl font-bold text-studied">{totalWords}</div>
              <div className="text-sm text-muted-foreground">Words Studied</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-vibrant-cyan/10 rounded-lg">
              <Trophy className="w-6 h-6 text-vibrant-cyan" />
            </div>
            <div>
              <div className="text-2xl font-bold text-vibrant-cyan">{masteredWords}</div>
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
            <div className="p-3 bg-progress/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-progress" />
            </div>
            <div>
              <div className="text-2xl font-bold text-progress">{averageProgress}%</div>
              <div className="text-sm text-muted-foreground">Avg. Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
