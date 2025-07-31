import React from 'react';
import { Button } from '@/components/ui/button';
import { Card as FlashCard } from '@/data/flashcards';
import { RotateCcw } from 'lucide-react';

interface FlashcardComponentProps {
  flashcard: FlashCard;
  isFlipped: boolean;
  onFlip: () => void;
}

export const FlashcardComponent: React.FC<FlashcardComponentProps> = ({ 
  flashcard, 
  isFlipped, 
  onFlip 
}) => {
  return (
    <div className="perspective-1000 w-full h-80">
      <div 
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <Button
            variant="flashcard"
            className="w-full h-full flex flex-col items-center justify-center text-center p-8 cursor-pointer"
            onClick={onFlip}
            disabled={isFlipped}
          >
            <div className="text-2xl font-semibold text-card-foreground mb-4">
              {flashcard.front}
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Tap to flip
            </div>
          </Button>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full bg-gradient-card border border-border rounded-lg shadow-elevated flex flex-col items-center justify-center text-center p-8">
            <div className="text-xl text-muted-foreground mb-2">Answer:</div>
            <div className="text-3xl font-bold text-primary mb-4">
              {flashcard.back}
            </div>
            <div className="text-sm text-muted-foreground">
              Did you remember this correctly?
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};