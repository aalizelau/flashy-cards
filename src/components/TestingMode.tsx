import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FlashcardComponent } from './FlashcardComponent';
import { Card, TestResult } from '@/data/flashcards';
import { useCompleteStudySession } from '@/hooks/useApi';
import { BookOpen, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface TestingModeProps {
  flashcards: Card[];
  onComplete: (results: TestResult[]) => void;
  onBackToBrowser?: () => void;
  deckId?: number;
}

export const TestingMode: React.FC<TestingModeProps> = ({ flashcards, onComplete, onBackToBrowser, deckId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const completeSessionMutation = useCompleteStudySession();

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex) / flashcards.length) * 100;

  const handleCardFlip = () => {
    setIsFlipped(true);
  };

  const handleResponse = async (remembered: boolean) => {
    const result: TestResult = {
      card_id: currentCard.id,
      remembered,
    };

    const newResults = [...results, result];
    setResults(newResults);

    if (currentIndex === flashcards.length - 1) {
      // Test complete - submit to API if deckId is provided
      if (deckId) {
        try {
          await completeSessionMutation.mutateAsync({
            deck_id: deckId,
            test_results: newResults
          });
        } catch (error) {
          console.error('Failed to submit test results:', error);
          // Still proceed with completing the test locally
        }
      }
      
      onComplete(newResults);
    } else {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

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
            Back to Browser
          </Button>
        </div>
      )}
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Flashcard Test</h1>
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
          flashcard={currentCard}
          isFlipped={isFlipped}
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

      {!isFlipped && (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Tap the card to reveal the answer
          </p>
        </div>
      )}
    </div>
  );
};