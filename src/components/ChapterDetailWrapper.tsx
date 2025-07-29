import React from "react";
import { useParams } from "react-router-dom";
import ChapterDetail from "./ChapterDetail";
import { Flashcard } from "./FlashcardApp";

// Sample data (same as ListView)
const sampleFlashcards: Flashcard[] = [
  { id: '1', front: 'Hello', back: 'Hola' },
  { id: '2', front: 'Thank you', back: 'Gracias' },
  { id: '3', front: 'Goodbye', back: 'Adiós' },
  { id: '4', front: 'Please', back: 'Por favor' },
  { id: '5', front: 'Water', back: 'Agua' },
  { id: '6', front: 'House', back: 'Casa' },
  { id: '7', front: 'Cat', back: 'Gato' },
  { id: '8', front: 'Dog', back: 'Perro' },
  { id: '9', front: 'Book', back: 'Libro' },
  { id: '10', front: 'Friend', back: 'Amigo' },
];

interface FlashcardProgress {
  id: string;
  correctAnswers: number;
  totalAttempts: number;
  lastAttempted?: Date;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered';
}

const progressData: FlashcardProgress[] = sampleFlashcards.map(card => ({
  id: card.id,
  correctAnswers: Math.floor(Math.random() * 10),
  totalAttempts: Math.floor(Math.random() * 15) + 1,
  lastAttempted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  proficiencyLevel: ['beginner', 'intermediate', 'advanced', 'mastered'][Math.floor(Math.random() * 4)] as any
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
