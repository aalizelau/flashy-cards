import React, { useState } from 'react';
import { TestingMode } from './TestingMode';
import { ReviewMode } from './ReviewMode';
import { BrowserMode } from './BrowserMode';
import { ListView, Chapter } from './ListView';
import { ChapterDetail } from './ChapterDetail';

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

// Sample chapters for demonstration
const sampleChapters: Chapter[] = [
  {
    id: '1',
    title: 'Basic Greetings',
    description: 'Essential greetings and polite expressions',
    coverImage: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=600&fit=crop',
    wordCount: 4,
    progress: 63,
    flashcardIds: ['1', '2', '3', '4']
  },
  {
    id: '2',
    title: 'Food & Drinks',
    description: 'Common words for food and beverages',
    coverImage: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=600&fit=crop',
    wordCount: 2,
    progress: 80,
    flashcardIds: ['5', '6']
  },
  {
    id: '3',
    title: 'Animals',
    description: 'Common animal names',
    coverImage: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=600&fit=crop',
    wordCount: 2,
    progress: 45,
    flashcardIds: ['7', '8']
  },
  {
    id: '4',
    title: 'All Words',
    description: 'Complete collection of all flashcards',
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=600&fit=crop',
    wordCount: 10,
    progress: 62,
    flashcardIds: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
  }
];

const FlashcardApp: React.FC = () => {
  const [mode, setMode] = useState<'list' | 'chapterDetail' | 'browser' | 'testing' | 'review'>('list');
  const [results, setResults] = useState<FlashcardResult[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

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

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setMode('chapterDetail');
  };

  const handleBackToList = () => {
    setSelectedChapter(null);
    setMode('list');
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      {mode === 'list' && (
        <ListView 
          chapters={sampleChapters}
          onChapterClick={handleChapterClick}
          onStartTest={handleStartTest}
          onViewReview={handleViewReview}
        />
      )}
      {mode === 'chapterDetail' && selectedChapter && (
        <ChapterDetail 
          chapter={selectedChapter}
          flashcards={sampleFlashcards}
          onBack={handleBackToList}
          onStartTest={handleStartTest}
        />
      )}
      {mode === 'browser' && (
        <BrowserMode 
          flashcards={sampleFlashcards}
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
  );
};

export default FlashcardApp;