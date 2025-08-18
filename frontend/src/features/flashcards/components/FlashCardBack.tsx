import React from "react";

import FlashCardBase from "./FlashCardBase";

interface FlashCardBackProps {
    front: string;
    back: string;
    audioUrl?: string;
    onClick?: () => void;
    exampleSentence1?: string;
    sentenceTranslation1?: string;
    exampleSentence2?: string;
    sentenceTranslation2?: string;
}

const FlashCardBack: React.FC<FlashCardBackProps> = ({ 
    front, 
    back, 
    audioUrl, 
    onClick, 
    exampleSentence1,
    sentenceTranslation1,
    exampleSentence2,
    sentenceTranslation2
}) => {
    // Create examples array from the new sentence fields
    const examplesData = [];
    if (exampleSentence1 && sentenceTranslation1) {
        examplesData.push({
            italian: exampleSentence1,
            english: sentenceTranslation1
        });
    }
    if (exampleSentence2 && sentenceTranslation2) {
        examplesData.push({
            italian: exampleSentence2,
            english: sentenceTranslation2
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
                                <p className="text-xs text-gray-500 italic font-light ">
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