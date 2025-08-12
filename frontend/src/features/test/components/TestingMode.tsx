import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { FlashcardComponent } from '@/features/flashcards/components/FlashcardComponent';
import { Card, TestResult, StudySessionRequest } from '@/shared/types/api';
import { useStartTestSession, useCompleteStudySession } from '@/shared/hooks/useApi';
import { BookOpen, ArrowLeft, Check, X } from 'lucide-react';

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
  const [animateFlip, setAnimateFlip] = useState(true); 
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
    setIsFlipped(!isFlipped);
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
      setAnimateFlip(false);
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
      requestAnimationFrame(() => setAnimateFlip(true));
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
    <div className="container mx-auto px-0 py-8 w-[500px]">
      {/* Back to Browser Button */}
      {onBackToBrowser && (
        <div className="mb-12 mt-8 ">
          <Button
            variant="outline"
            onClick={onBackToBrowser}
            className="gap-2 px-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      )}
      
      {/* Header */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-start gap-2">
          <h1 className="text-3xl font-semibold font-alumni-sans text-main-foreground">Your Progress </h1>
        </div>
        {/* <p className="text-muted-foreground">
          Card {currentIndex + 1} of {flashcards.length}
        </p> */}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={progress} className="h-3 mb-1" />
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
          {/* <span>Progress</span>
           */}
                   <p className="text-muted-foreground">
          Card {currentIndex + 1} of {flashcards.length}
        </p>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-8 flex justify-center">
        <div className="w-[500px]">
          <FlashcardComponent
            flashcard={displayCard}
            isFlipped={isFlipped}
            isSwapped={isSwapped}
            onFlip={handleCardFlip}
            animateFlip={animateFlip}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-12 justify-center animate-scale-in">
  <Button
    variant="forgot"
    size="icon-lg" // important: makes it a square button
    onClick={() => handleResponse(false)}
    className="rounded-full flex items-center justify-center "
  >
    <X className="h-8 w-8" /> {/* Bigger icon */}
  </Button>

  <Button
    variant="remembered"
    size="icon-lg"
    onClick={() => handleResponse(true)}
    className=" rounded-full flex items-center justify-center"
  >
    <Check className="h-8 w-8" />
  </Button>
</div>

    </div>
  );
};