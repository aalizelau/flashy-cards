import React, { useEffect } from 'react';
import { Card as FlashCard } from '@/shared/types/api';
import FlashCardFront from './FlashCardFront';
import FlashCardBack from './FlashCardBack';

interface FlashcardComponentProps {
  flashcard: FlashCard;
  isFlipped: boolean;
  isSwapped?: boolean;
  onFlip: () => void;
  animateFlip?: boolean;
}

export const FlashcardComponent: React.FC<FlashcardComponentProps> = ({
  flashcard,
  isFlipped,
  onFlip,
  animateFlip = true,
}) => {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        onFlip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onFlip]);

  return (
    <div className="perspective-1000 w-full h-80 ">
      <div
        className={`relative w-full h-full transform-style-preserve-3d ${animateFlip ? 'transition-transform duration-700' : ''
          } ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        <FlashCardFront word={flashcard.front} audioUrl={flashcard.audio_url} onClick={onFlip} />
        <FlashCardBack
          front={flashcard.front}
          back={flashcard.back}
          audioUrl={flashcard.audio_url}
          onClick={onFlip}
          customData={flashcard.custom_data}
        />
      </div>
    </div>
  );
};