import React from "react";

import FlashCardBase from "./FlashCardBase";

interface FlashCardBackProps {
    front: string;
    back: string;
    audioUrl?: string;
    onClick?: () => void;
    exampleSentences?: Array<{
        italian: string;
        english: string;
    }>;
}

const FlashCardBack: React.FC<FlashCardBackProps> = ({ front, back, audioUrl, onClick, exampleSentences }) => {
    // Temporary dummy data for testing - remove this when backend supports example_sentences
    const dummyExamples = [
        {
            italian: "Ho comprato una mela al mercato.",
            english: "I bought an apple at the market."
        },
        // {
        //     italian: "La mela è molto dolce e succosa.",
        //     english: "The apple is very sweet and juicy."
        // }
    ];
    
    // Use dummy data for ALL cards if no real examples are provided (for testing)
    const examplesData = exampleSentences || dummyExamples;
    
    return (
        <FlashCardBase word={front} audioUrl={audioUrl} className="rotate-y-180 items-center justify-center text-center !shadow-elevated" onClick={onClick}>
            {examplesData && examplesData.length > 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-4xl font-bold text-blue-800">
                        Varamente
                    </h2>
                    <h3 className="text-xl font-semibold text-muted-foreground mb-6">
                        Really
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