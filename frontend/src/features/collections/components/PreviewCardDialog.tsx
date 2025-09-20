import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { FlashcardComponent } from '@/features/flashcards/components/FlashcardComponent';
import { Card } from '@/shared/types/api';

interface PreviewCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardData: {
    front: string;
    back: string;
    exampleSentence1?: string;
    sentenceTranslation1?: string;
    exampleSentence2?: string;
    sentenceTranslation2?: string;
  };
}

const PreviewCardDialog: React.FC<PreviewCardDialogProps> = ({
  open,
  onOpenChange,
  cardData,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Create a mock Card object for the preview
  const previewCard: Card = {
    id: -1, // Mock ID
    deck_id: -1, // Mock deck ID
    front: cardData.front || 'Front text preview',
    back: cardData.back || 'Back text preview',
    example_sentence_1: cardData.exampleSentence1,
    sentence_translation_1: cardData.sentenceTranslation1,
    example_sentence_2: cardData.exampleSentence2,
    sentence_translation_2: cardData.sentenceTranslation2,
    accuracy: 0,
    total_attempts: 0,
    correct_answers: 0,
    last_reviewed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    custom_data: {
      ...(cardData.exampleSentence1 && { 'Example 1': cardData.exampleSentence1 }),
      ...(cardData.sentenceTranslation1 && { 'Translation 1': cardData.sentenceTranslation1 }),
      ...(cardData.exampleSentence2 && { 'Example 2': cardData.exampleSentence2 }),
      ...(cardData.sentenceTranslation2 && { 'Translation 2': cardData.sentenceTranslation2 }),
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleClose = () => {
    setIsFlipped(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-alumni-sans text-3xl text-main-foreground">
            Flashcard Preview
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <FlashcardComponent
            flashcard={previewCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            animateFlip={true}
          />
        </div>

        <div className="text-center text-sm text-gray-500 pb-4">
          Click the card or press Space to flip
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewCardDialog;