import React from "react";

import FlashCardBase from "./FlashCardBase";

interface FlashCardBackProps {
    front: string;
    back: string;
    audioUrl?: string;
    onClick?: () => void;
    example_sentence_1?: string;
    sentence_translation_1?: string;
    example_sentence_2?: string;
    sentence_translation_2?: string;
}

const FlashCardBack: React.FC<FlashCardBackProps> = ({ 
    front, 
    back, 
    audioUrl, 
    onClick, 
    example_sentence_1,
    sentence_translation_1,
    example_sentence_2,
    sentence_translation_2
}) => {
    // Create examples array from the new sentence fields
    const examplesData = [];
    if (example_sentence_1 && sentence_translation_1) {
        examplesData.push({
            italian: example_sentence_1,
            english: sentence_translation_1
        });
    }
    if (example_sentence_2 && sentence_translation_2) {
        examplesData.push({
            italian: example_sentence_2,
            english: sentence_translation_2
        });
    }
    
    return (
        <FlashCardBase word={front} audioUrl={audioUrl} className="rotate-y-180 items-center justify-center text-center !shadow-elevated" onClick={onClick}>
            {examplesData && examplesData.length > 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-4xl font-bold text-blue-800">
                        {front}
                    </h2>
                    <h3 className="text-xl font-semibold text-muted-foreground mb-6">
                        {back}
                    </h3>
                    
                    <div className="space-y-6 flex flex-col justify-center">
                        {examplesData.map((example, index) => (
                            <div key={index} className="space-y-1">
                                <p className="text-sm italic text-gray-700 font-medium">
                                    {example.italian}
                                </p>
                                <p className="text-sm text-gray-500 italic font-light ">
                                    {example.english}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="display-block pt-4">
                    <div className="text-4xl font-bold text-blue-500">{front}</div>
                    <div className="">{back}</div>
                </div>
            )}
        </FlashCardBase>
    );
};

export default FlashCardBack;