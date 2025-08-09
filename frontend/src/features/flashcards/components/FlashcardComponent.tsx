import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card as FlashCard } from '@/shared/types/api';
import { RotateCcw, Volume2} from 'lucide-react';

interface FlashcardComponentProps {
  flashcard: FlashCard;
  isFlipped: boolean;
  isSwapped?: boolean;
  onFlip: () => void;
}

export const FlashcardComponent: React.FC<FlashcardComponentProps> = ({ 
  flashcard, 
  isFlipped, 
  isSwapped = false,
  onFlip 
}) => {
  const [playingAudio, setPlayingAudio] = useState(false);

  const playAudio = async () => {
    if (!flashcard.audio_url) return;
    
    try {
      setPlayingAudio(true);
      const audio = new Audio(flashcard.audio_url);
      
      audio.onended = () => setPlayingAudio(false);
      audio.onerror = () => {
        setPlayingAudio(false);
        console.error('Failed to play audio for:', flashcard.front);
      };
      
      await audio.play();
    } catch (error) {
      setPlayingAudio(false);
      console.error('Audio playback failed:', error);
    }
  };
  return (
    <div className="perspective-1000 w-full h-80 ">
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
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-3xl font-bold text-main-foreground">
                {flashcard.front}
              </div>
              {/* Show audio on front when not swapped (original front = learning word) */}
              {!isSwapped && flashcard.audio_url && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio();
                  }}
                  disabled={playingAudio}
                  aria-label={`Play audio for ${flashcard.front}`}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <Volume2 className={`w-4 h-4 ${playingAudio ? 'text-blue-500 animate-pulse' : 'text-muted-foreground hover:text-blue-500'}`} />
                </Button>
              )}
            </div>
          </Button>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full bg-gradient-card border border-border rounded-lg shadow-elevated flex flex-col items-center justify-center text-center p-8 cursor-pointer" onClick={onFlip}>
            <div className="text-xl text-muted-foreground mb-2">Answer:</div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-3xl font-bold text-primary">
                {flashcard.back}
              </div>
              {/* Show audio on back when swapped (original front is now on back = learning word) */}
              {isSwapped && flashcard.audio_url && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio();
                  }}
                  disabled={playingAudio}
                  aria-label={`Play audio for ${flashcard.front}`}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <Volume2 className={`w-4 h-4 ${playingAudio ? 'text-blue-500 animate-pulse' : 'text-muted-foreground hover:text-blue-500'}`} />
                </Button>
              )}
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