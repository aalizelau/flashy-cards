import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { FlashcardComponent } from '@/features/flashcards/components/FlashcardComponent';
import { Card, TestResult, StudySessionRequest } from '@/shared/types/api';
import { useStartTestSession, useCompleteStudySession } from '@/shared/hooks/useApi';
import { BookOpen, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface TestingModeProps {
  testType: 'test_all' | 'test_by_decks' | 'test_unfamiliar' | 'test_newly_added';
  deckIds?: number[];
  limit: number;
  isSwapped?: boolean;
  onComplete: (results: TestResult[]) => void;
  onBackToBrowser?: () => void;
}

export const TestingMode: React.FC<TestingModeProps> = ({ testType, deckIds, limit, isSwapped = false, onComplete, onBackToBrowser }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [flashcards, setFlashcards] = useState<Card[]>([]);
  
  const startTestSessionMutation = useStartTestSession();
  const completeSessionMutation = useCompleteStudySession();

  // Start test session when component mounts
  useEffect(() => {
    const initializeTestSession = async () => {
      try {
        const sessionRequest: StudySessionRequest = {
          test_type: testType,
          limit,
          ...(deckIds && { deck_ids: deckIds })
        };
        
        const studySession = await startTestSessionMutation.mutateAsync(sessionRequest);
        setFlashcards(studySession.cards);
      } catch (error) {
        console.error('Failed to start test session:', error);
      }
    };

    initializeTestSession();
  }, [testType, deckIds, limit]);

  const currentCard = flashcards[currentIndex];
  const progress = flashcards.length > 0 ? ((currentIndex) / flashcards.length) * 100 : 0;

  // Create display card with swapped content if needed
  const displayCard = currentCard && isSwapped ? {
    ...currentCard,
    front: currentCard.back,
    back: currentCard.front
  } : currentCard;

  const handleCardFlip = () => {
    setIsFlipped(true);
  };

  const handleResponse = async (remembered: boolean) => {
    const result: TestResult = {
      card_id: currentCard.id,
      front: currentCard.front,
      back: currentCard.back,
      remembered,
    };

    const newResults = [...results, result];
    setResults(newResults);

    if (currentIndex === flashcards.length - 1) {
      // Test complete - submit to API
      try {
        const apiPayload = newResults.map(result => ({
          card_id: result.card_id,
          remembered: result.remembered
        }));
        
        await completeSessionMutation.mutateAsync(apiPayload);
      } catch (error) {
        console.error('Failed to submit test results:', error);
        // Still proceed with completing the test locally
      }
      
      onComplete(newResults);
    } else {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  // Show loading state while initializing study session
  if (startTestSessionMutation.isPending || flashcards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">Starting study session...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (startTestSessionMutation.isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error Starting Study Session</h2>
          <p className="mb-4">{startTestSessionMutation.error?.message || 'Failed to start test session'}</p>
          <div className="space-x-4">
            <Button 
              onClick={() => window.location.reload()}
              variant="destructive"
            >
              Retry
            </Button>
            {onBackToBrowser && (
              <Button 
                onClick={onBackToBrowser}
                variant="outline"
              >
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Back to Browser Button */}
      {onBackToBrowser && (
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBackToBrowser}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      )}
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          {/* <BookOpen className="h-8 w-8 text-primary" /> */}
          <h1 className="text-3xl font-bold text-foreground">Test All Words</h1>
        </div>
        <p className="text-muted-foreground">
          Card {currentIndex + 1} of {flashcards.length}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Flashcard */}
      <div className="mb-8">
        <FlashcardComponent
          flashcard={displayCard}
          isFlipped={isFlipped}
          isSwapped={isSwapped}
          onFlip={handleCardFlip}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center animate-scale-in">
        <Button
          variant="forgot"
          size="xl"
          onClick={() => handleResponse(false)}
          className="flex-1 max-w-48"
        >
          <XCircle className="mr-2" />
          I Forgot
        </Button>
        <Button
          variant="remembered"
          size="xl"
          onClick={() => handleResponse(true)}
          className="flex-1 max-w-48"
        >
          <CheckCircle className="mr-2" />
          I Remembered
        </Button>
      </div>
    </div>
  );
};