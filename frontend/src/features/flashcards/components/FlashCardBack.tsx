import React from "react";

import FlashCardBase from "./FlashCardBase";

interface FlashCardBackProps {
    front: string;
    back: string;
    audioUrl?: string;
    onClick?: () => void;
}

const FlashCardBack: React.FC<FlashCardBackProps> = ({ front, back, audioUrl, onClick }) => {
    return (
        <FlashCardBase word={front} audioUrl={audioUrl} className="rotate-y-180 items-center justify-center text-center !shadow-elevated" onClick={onClick}>
            <div className="display-block pt-4">
                <div className="text-4xl font-bold text-black text-blue-500">{front}</div>
                <div className="">{back}</div>
            </div>
        </FlashCardBase>
    );
};

export default FlashCardBack;