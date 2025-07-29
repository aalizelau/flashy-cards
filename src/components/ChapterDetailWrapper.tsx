import React from "react";
import { useParams } from "react-router-dom";
import ChapterDetail from "./ChapterDetail";
import { Flashcard, FlashcardProgress, sampleFlashcards } from "@/data/flashcards";


const progressData: FlashcardProgress[] = sampleFlashcards.map(card => ({
  id: card.id,
  correctAnswers: Math.floor(Math.random() * 10),
  totalAttempts: Math.floor(Math.random() * 15) + 1,
  lastAttempted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  proficiencyLevel: ['beginner', 'intermediate', 'advanced', 'mastered'][
    Math.floor(Math.random() * 4)
  ] as FlashcardProgress['proficiencyLevel']
}));

const ChapterDetailWrapper: React.FC = () => {
  const { collectionName } = useParams();
  return (
    <ChapterDetail
      collectionName={collectionName || "All Words"}
      flashcards={sampleFlashcards}
      progressData={progressData}
    />
  );
};

export default ChapterDetailWrapper;
