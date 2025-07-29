import React, { useState } from 'react';
import { TestingMode } from './TestingMode';
import { ReviewMode } from './ReviewMode';
import { BrowserMode } from './BrowserMode';
import { MainDashboard } from './TestOptions';
import {
  Flashcard,
  FlashcardResult,
  sampleFlashcards,
} from '@/data/flashcards';

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
          // <BrowserMode 
          <MainDashboard 
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
    </div>
  );
};

export default FlashcardApp;