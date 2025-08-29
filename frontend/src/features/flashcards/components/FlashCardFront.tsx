import React, { useEffect, useRef } from "react";

import FlashCardBase from "./FlashCardBase";

interface FlashCardFrontProps {
    word: string;
    audioUrl?: string;
    onClick?: () => void;
}

const FlashCardFront: React.FC<FlashCardFrontProps> = ({ word, audioUrl, onClick }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const autoPlayAudio = async () => {
            if (!audioUrl) return;

            try {
                if (audioRef.current) {
                    audioRef.current.pause();
                }
                
                audioRef.current = new Audio(audioUrl);
                await audioRef.current.play();
            } catch (error) {
                console.error('Auto-play audio failed:', error);
            }
        };

        autoPlayAudio();

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [word, audioUrl]);

    return (
        <FlashCardBase word={word} audioUrl={audioUrl} className="items-center justify-center text-center" onClick={onClick}>
            <div className="text-4xl font-bold text-black">{word}</div>
            <span className="lowercase absolute text-xs text-gray-400 bottom-3 left-1/2 transform -translate-x-1/2">
                Space / click to flip
            </span>
        </FlashCardBase>
    );
};

export default FlashCardFront;