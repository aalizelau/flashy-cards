import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainDashboard } from '@/components/MainDashboard';
import { useDecks, useAnalytics } from '@/hooks/useApi';

const DashboardContainer: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: decks, isLoading: decksLoading, error: decksError } = useDecks();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAnalytics();
  
  const selectedDeckId = decks?.[2]?.id || 1;

  const handleStartTest = () => {
    navigate(`/study/${selectedDeckId}`);
  };

  const handleViewReview = () => {
    navigate(`/study/${selectedDeckId}?mode=review`);
  };

  const handleDeckChange = (deckId: number) => {
    window.location.href = `/dashboard?deck=${deckId}`;
  };

  const isLoading = decksLoading || analyticsLoading;
  const error = decksError || analyticsError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
          <p className="mb-4">
            {error?.message || 'Failed to load dashboard data'}
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
    <MainDashboard
      flashcards={[]}
      onStartTest={handleStartTest}
      onViewReview={handleViewReview}
      decks={decks}
      selectedDeckId={selectedDeckId}
      onDeckChange={handleDeckChange}
      analytics={analytics}
    />
  );
};

export default DashboardContainer;