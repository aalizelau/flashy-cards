import React, { useState } from "react";
import { Button } from '@/shared/components/ui/button';
import { RotateCcw, Volume2 } from 'lucide-react';

interface FlashCardBaseProps {
    children?: React.ReactNode;
    className?: string;

    word: string;
    audioUrl?: string;

    onClick?: () => void;
}

const FlashCardBase: React.FC<FlashCardBaseProps> = ({ children, className = "", onClick, word, audioUrl }) => {
    const [playingAudio, setPlayingAudio] = useState(false);

    const playAudio = async () => {
        if (!audioUrl) return;

        try {
          setPlayingAudio(true);
          const audio = new Audio(audioUrl);

          audio.onended = () => setPlayingAudio(false);
          audio.onerror = () => {
            setPlayingAudio(false);
            console.error('Failed to play audio for:', word);
          };
    
          await audio.play();
        } catch (error) {
          setPlayingAudio(false);
          console.error('Audio playback failed:', error);
        }
      };


    return (
        <div
            className={`absolute inset-0 w-full h-full backface-hidden flex rounded-2xl border border-gray-200 shadow-sm p-8 cursor-pointer bg-white ${className}`}
            onClick={onClick}
        >
            {children}
            <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                    e.stopPropagation();
                    playAudio();
                }}
                aria-label={`Play audio for ${word}`}
                disabled={playingAudio}
                className={`absolute top-0 right-0 transform h-8 w-8 p-7 flex-shrink-0 text-gray-400`}
            >
                <Volume2 className="!w-6 !h-6" />
            </Button>
            <span className="lowercase absolute text-xs text-gray-400 bottom-3 left-1/2 transform -translate-x-1/2">
                Space / click to flip
            </span>
        </div>
    )
};

export default FlashCardBase;