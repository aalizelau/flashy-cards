import React from "react";

import FlashCardBase from "./FlashCardBase";

interface FlashCardBackProps {
    front: string;
    back: string;
    audioUrl?: string;
    onClick?: () => void;
    customData?: { [fieldName: string]: string };
}

const FlashCardBack: React.FC<FlashCardBackProps> = ({
    front,
    back,
    audioUrl,
    onClick,
    customData
}) => {

    return (
        <FlashCardBase word={front} audioUrl={audioUrl} className="rotate-y-180 items-center justify-center text-center !shadow-elevated" onClick={onClick}>
            <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-4xl font-bold text-blue-800">
                    {back}
                </h2>
                <h3 className="text-xl font-semibold text-muted-foreground mb-6">
                    {front}
                </h3>

                {customData && Object.keys(customData).length > 0 && (
                    <div className="space-y-2 flex flex-col justify-center max-w-sm">
                        {Object.values(customData).map((value, index) => (
                            <p key={index} className="text-sm italic text-gray-700 font-medium">
                                {value}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </FlashCardBase>
    );
};

export default FlashCardBack;