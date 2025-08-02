import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { TestingMode } from '@/components/TestingMode';
import { ReviewMode } from '@/components/ReviewMode';
import { TestResult, StudySessionResponse } from '@/data/flashcards';

const StudySession: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<'testing' | 'review'>('testing');
  const [results, setResults] = useState<TestResult[]>([]);
  const [studySessionResponse, setStudySessionResponse] = useState<StudySessionResponse | null>(null);
  
  const deckIdNum = parseInt(deckId || '1');

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
          deckId={deckIdNum}
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

export default StudySession;