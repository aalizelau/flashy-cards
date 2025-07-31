import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { TestingMode } from '@/components/TestingMode';
import { ReviewMode } from '@/components/ReviewMode';
import { useDeckCards } from '@/hooks/useApi';
import { TestResult, StudySessionResponse } from '@/data/flashcards';

const StudySession: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<'testing' | 'review'>('testing');
  const [results, setResults] = useState<TestResult[]>([]);
  const [studySessionResponse, setStudySessionResponse] = useState<StudySessionResponse | null>(null);
  
  const deckIdNum = parseInt(deckId || '1');
  const { data: cards, isLoading, error } = useDeckCards(deckIdNum);

  // Check if we should start in review mode (from URL params)
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'review') {
      setMode('review');
    }
  }, [searchParams]);

  const handleTestComplete = (testResults: TestResult[]) => {
    setResults(testResults);
    setMode('review');
  };

  const handleRestartTest = () => {
    setResults([]);
    setStudySessionResponse(null);
    setMode('testing');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading study session...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error Loading Study Session</h2>
          <p className="mb-4">{error.message}</p>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
            <button 
              onClick={handleBackToDashboard}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no cards available
  if (!cards || cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Cards Available</h2>
          <p className="mb-4">This deck doesn't have any cards to study.</p>
          <button 
            onClick={handleBackToDashboard}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {mode === 'testing' && (
        <TestingMode 
          flashcards={cards} 
          onComplete={handleTestComplete}
          onBackToBrowser={handleBackToDashboard}
          deckId={deckIdNum}
        />
      )}
      {mode === 'review' && (
        <ReviewMode 
          results={results} 
          onRestart={handleRestartTest}
          onBackToBrowser={handleBackToDashboard}
          studySessionResponse={studySessionResponse}
        />
      )}
    </div>
  );
};

export default StudySession;