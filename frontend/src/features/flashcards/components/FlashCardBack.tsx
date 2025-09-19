import React from "react";

import FlashCardBase from "./FlashCardBase";
import { CustomField } from "@/shared/types/api";
import { getCustomFieldValue } from "@/shared/utils/customFields";

interface FlashCardBackProps {
    front: string;
    back: string;
    audioUrl?: string;
    onClick?: () => void;
    customFields?: CustomField[];
    customData?: { [fieldName: string]: string };
}

const FlashCardBack: React.FC<FlashCardBackProps> = ({
    front,
    back,
    audioUrl,
    onClick,
    customFields,
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

                {customFields && customFields.length > 0 && (
                    <div className="space-y-2 flex flex-col justify-center max-w-sm">
                        {customFields.map((field) => {
                            const value = getCustomFieldValue(customData, field.name);
                            return value ? (
                                <p key={field.name} className="text-sm italic text-gray-700 font-medium">
                                    {value}
                                </p>
                            ) : null;
                        })}
                    </div>
                )}
            </div>
        </FlashCardBase>
    );
};

export default FlashCardBack;