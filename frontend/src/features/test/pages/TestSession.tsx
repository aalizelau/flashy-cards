import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TestingMode } from '../components/TestingMode';
import { ReviewMode } from '../components/ReviewMode';
import { TestResult, StudySessionResponse } from '@/shared/types/api';

const TestSession: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<'testing' | 'review'>('testing');
  const [results, setResults] = useState<TestResult[]>([]);
  const [studySessionResponse, setStudySessionResponse] = useState<StudySessionResponse | null>(null);
  
  // Extract test parameters from URL query params
  const testType = searchParams.get('type') as 'test_all' | 'test_by_decks' | 'test_unfamiliar' | 'test_newly_added' || 'test_all';
  const limit = parseInt(searchParams.get('limit') || '10');
  const deckIdsString = searchParams.get('deck_ids');
  const deckIds = deckIdsString ? deckIdsString.split(',').map(id => parseInt(id)) : undefined;

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

  return (
    <div className="min-h-screen bg-gradient-bg">
      {mode === 'testing' && (
        <TestingMode 
          testType={testType}
          deckIds={deckIds}
          limit={limit}
          onComplete={handleTestComplete}
          onBackToBrowser={handleBackToDashboard}
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

export default TestSession;