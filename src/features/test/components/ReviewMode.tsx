import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { TestResult, StudySessionResponse, Card as FlashCard } from '@/shared/types/api';
import { CheckCircle, XCircle, Trophy, RotateCcw, Brain, Target, Zap, ArrowLeft } from 'lucide-react';

interface ReviewModeProps {
  results: TestResult[];
  onRestart: () => void;
  onBackToBrowser?: () => void;
  studySessionResponse?: StudySessionResponse | null;
}

export const ReviewMode: React.FC<ReviewModeProps> = ({ results, onRestart, onBackToBrowser, studySessionResponse }) => {
  // Use session response data if available, otherwise fall back to local results
  const passed = results.filter((r) => r.remembered);
  const missed = results.filter((r) => !r.remembered);
  const correctAnswers = results.filter(r => r.remembered).length;
  const totalCards = results.length;
  const accuracy = Math.round((correctAnswers / totalCards) * 100);

  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return 'text-success';
    if (acc >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getAccuracyIcon = (acc: number) => {
    if (acc >= 80) return <Trophy className="w-6 h-6 text-success" />;
    if (acc >= 60) return <Target className="w-6 h-6 text-warning" />;
    return <Brain className="w-6 h-6 text-destructive" />;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back to Browser Button */}
      {onBackToBrowser && (
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBackToBrowser}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browser
          </Button>
        </div>
      )}
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          {getAccuracyIcon(accuracy)}
          <h1 className="text-4xl font-bold text-foreground">Test Complete!</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Here's how you performed on your flashcard test
        </p>
      </div>

      {/* Overall Results */}
      <Card className="mb-8 bg-gradient-card shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Overall Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-1">{correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground mb-1">{totalCards}</div>
              <div className="text-sm text-muted-foreground">Total Cards</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${getAccuracyColor(accuracy)}`}>
                {accuracy}%
              </div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Familiarity Levels */}
      <div className="grid gap-6 mb-8">
        {/* Passed Cards */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              Passed ({passed.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passed.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {passed.map((result) => (
                  <div
                    key={result.card_id}
                    className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20"
                  >
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{result.front}</div>
                      <div className="text-xs text-muted-foreground truncate">{result.back}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Great job! You remembered all the cards.</p>
            )}
          </CardContent>
        </Card>


        {/* Missed Cards */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Missed ({missed.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
          {missed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {missed.map((result) => (
                <div
                  key={result.card_id}
                  className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20"
                >
                  <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{result.front}</div>
                    <div className="text-xs text-muted-foreground truncate">{result.back}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Great! You knew all the cards.</p>
          )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={onRestart}
          size="xl"
          className="bg-gradient-primary hover:scale-105 transform transition-all"
        >
          <RotateCcw className="mr-2" />
          Take Test Again
        </Button>
        {onBackToBrowser && (
          <Button
            variant="outline"
            onClick={onBackToBrowser}
            size="xl"
            className="hover:scale-105 transform transition-all"
          >
            <ArrowLeft className="mr-2" />
            Back to Browser
          </Button>
        )}
      </div>
    </div>
  );
};