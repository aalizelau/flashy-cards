import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestResult, StudySessionResponse, Card as FlashCard } from '@/data/flashcards';
import { CheckCircle, XCircle, Trophy, RotateCcw, Brain, Target, Zap, ArrowLeft } from 'lucide-react';

interface ReviewModeProps {
  results: TestResult[];
  onRestart: () => void;
  onBackToBrowser?: () => void;
  studySessionResponse?: StudySessionResponse | null;
}

export const ReviewMode: React.FC<ReviewModeProps> = ({ results, onRestart, onBackToBrowser, studySessionResponse }) => {
  // Use session response data if available, otherwise fall back to local results
  const correctAnswers = studySessionResponse?.summary.passed_count || results.filter(r => r.remembered).length;
  const totalCards = studySessionResponse?.summary.total_cards || results.length;
  const accuracy = studySessionResponse?.summary.accuracy_percentage || Math.round((correctAnswers / totalCards) * 100);

  // Use session response data for passed/missed cards
  const passedCardIds = studySessionResponse?.passed_words || [];
  const missedCardIds = studySessionResponse?.missed_words || [];
  
  // For this demo, we'll use simple logic - in a real app, this would be based on historical data
  const inProgressCards: TestResult[] = []; // No "in progress" in first attempt

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
              Passed ({passedCardIds.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passedCardIds.length > 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-success mb-2">{passedCardIds.length}</div>
                <p className="text-muted-foreground">Cards you remembered correctly!</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No cards passed yet. Keep practicing!</p>
            )}
          </CardContent>
        </Card>


        {/* Missed Cards */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Missed ({missedCardIds.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {missedCardIds.length > 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-destructive mb-2">{missedCardIds.length}</div>
                <p className="text-muted-foreground">Cards to review and practice more.</p>
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