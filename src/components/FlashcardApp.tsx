import React, { useState } from 'react';
import { TestingMode } from './TestingMode';
import { ReviewMode } from './ReviewMode';
import { BrowserMode } from './BrowserMode';
import { MainDashboard } from './TestOptions';
import {
  Card,
  StudySessionResponse,
  TestResult,
} from '@/data/flashcards';
import { useDecks, useDeckCards } from '@/hooks/useApi';

const FlashcardApp: React.FC = () => {
  const [mode, setMode] = useState<'browser' | 'testing' | 'review'>('browser');
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<number>(1); // Default to first deck
  const [studySessionResponse, setStudySessionResponse] = useState<StudySessionResponse | null>(null);

  // Fetch decks and cards data
  const { data: decks, isLoading: decksLoading, error: decksError } = useDecks();
  const { data: cards, isLoading: cardsLoading, error: cardsError } = useDeckCards(selectedDeckId);

  // Use cards directly
  const flashcards = cards || [];

  const handleTestComplete = (testResults: TestResult[]) => {
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

  // Show loading state
  if (decksLoading || cardsLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (decksError || cardsError) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
          <p className="mb-4">
            {decksError?.message || cardsError?.message || 'Failed to load flashcards'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg flex">
      <div className="flex-1 ">
        {mode === 'browser' && (
          <MainDashboard 
            flashcards={flashcards}
            onStartTest={handleStartTest}
            onViewReview={handleViewReview}
            decks={decks}
            selectedDeckId={selectedDeckId}
            onDeckChange={setSelectedDeckId}
          />
        )}
        {mode === 'testing' && (
          <TestingMode 
            flashcards={flashcards} 
            onComplete={handleTestComplete}
            onBackToBrowser={handleBackToBrowser}
            deckId={selectedDeckId}
          />
        )}
        {mode === 'review' && (
          <ReviewMode 
            results={results} 
            onRestart={handleRestartTest}
            onBackToBrowser={handleBackToBrowser}
            studySessionResponse={studySessionResponse}
          />
        )}
      </div>
    </div>
  );
};

export default FlashcardApp;