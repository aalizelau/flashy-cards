import React from "react";

import FlashCardBase from "./FlashCardBase";
import { CustomField } from "@/shared/types/api";
import { getCustomFieldValue } from "@/shared/utils/customFields";

interface FlashCardBackProps {
    front: string;
    back: string;
    audioUrl?: string;
    onClick?: () => void;
    example_sentence_1?: string;
    sentence_translation_1?: string;
    example_sentence_2?: string;
    sentence_translation_2?: string;
    customFields?: CustomField[];
    customData?: { [fieldName: string]: string };
}

const FlashCardBack: React.FC<FlashCardBackProps> = ({
    front,
    back,
    audioUrl,
    onClick,
    example_sentence_1,
    sentence_translation_1,
    example_sentence_2,
    sentence_translation_2,
    customFields,
    customData
}) => {
    // Prepare field data for rendering
    const fieldsToRender = [];

    // Handle custom fields if available
    if (customFields && customFields.length > 0) {
        customFields.forEach(field => {
            const value = getCustomFieldValue(customData, field.name);
            if (value) {
                fieldsToRender.push({
                    label: field.label,
                    value: value
                });
            }
        });
    } else {
        // Fallback to legacy fields for backward compatibility
        if (example_sentence_1 && sentence_translation_1) {
            fieldsToRender.push({
                label: "Example",
                value: example_sentence_1
            });
            fieldsToRender.push({
                label: "Translation",
                value: sentence_translation_1
            });
        }
        if (example_sentence_2 && sentence_translation_2) {
            fieldsToRender.push({
                label: "Example 2",
                value: example_sentence_2
            });
            fieldsToRender.push({
                label: "Translation 2",
                value: sentence_translation_2
            });
        }
    }

    return (
        <FlashCardBase word={front} audioUrl={audioUrl} className="rotate-y-180 items-center justify-center text-center !shadow-elevated" onClick={onClick}>
            <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-4xl font-bold text-blue-800">
                    {front}
                </h2>
                <h3 className="text-xl font-semibold text-muted-foreground mb-6">
                    {back}
                </h3>

                {fieldsToRender.length > 0 && (
                    <div className="space-y-4 flex flex-col justify-center max-w-sm">
                        {fieldsToRender.map((field, index) => (
                            <div key={index} className="space-y-1">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                    {field.label}
                                </p>
                                <p className="text-sm italic text-gray-700 font-medium">
                                    {field.value}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </FlashCardBase>
    );
};

export default FlashCardBack;