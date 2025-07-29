import React, { useState } from 'react';
import { TestingMode } from './TestingMode';
import { ReviewMode } from './ReviewMode';
import { MainDashboard } from './MainDashboard';

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

// Sample flashcards for demonstration
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

const FlashcardApp: React.FC = () => {
  const [mode, setMode] = useState<'browser' | 'testing' | 'review'>('browser');
  const [results, setResults] = useState<FlashcardResult[]>([]);

  const handleTestComplete = (testResults: FlashcardResult[]) => {
    setResults(testResults);
    setMode('review');
  };

  const handleRestartTest = () => {
    setResults([]);
    setMode('testing');
  };

  const handleStartTest = () => {
    setMode('testing');
  };

  const handleViewReview = () => {
    if (results.length > 0) {
      setMode('review');
    }
  };

  const handleBackToBrowser = () => {
    setMode('browser');
  };

  return (
    <div className="min-h-screen bg-gradient-bg flex">
      <div className="flex-1 ">
        {mode === 'browser' && (
          <MainDashboard 
            onStartTest={handleStartTest}
            onViewReview={handleViewReview}
          />
        )}
        {mode === 'testing' && (
          <TestingMode 
            flashcards={sampleFlashcards} 
            onComplete={handleTestComplete}
            onBackToBrowser={handleBackToBrowser}
          />
        )}
        {mode === 'review' && (
          <ReviewMode 
            results={results} 
            onRestart={handleRestartTest}
            onBackToBrowser={handleBackToBrowser}
          />
        )}
      </div>
    </div>
  );
};

export default FlashcardApp;