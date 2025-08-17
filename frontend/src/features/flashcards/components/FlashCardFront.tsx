import React from "react";

import FlashCardBase from "./FlashCardBase";

interface FlashCardFrontProps {
    word: string;
    audioUrl?: string;
    onClick?: () => void;
}

const FlashCardFront: React.FC<FlashCardFrontProps> = ({ word, audioUrl, onClick }) => {
    return (
        <FlashCardBase word={word} audioUrl={audioUrl} className="items-center justify-center text-center" onClick={onClick}>
            <div className="text-4xl font-bold text-black">{word}</div>
        </FlashCardBase>
    );
};

export default FlashCardFront;