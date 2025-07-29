export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardResult {
  flashcard: Flashcard;
  remembered: boolean;
  attempts: number;
}

export interface FlashcardProgress {
  id: string;
  correctAnswers: number;
  totalAttempts: number;
  lastAttempted?: Date;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered';
}

// Sample flashcards for demonstration
export const sampleFlashcards: Flashcard[] = [
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
