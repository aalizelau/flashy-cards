import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainDashboard } from '@/components/TestOptions';
import { useDecks, useDeckCards } from '@/hooks/useApi';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Fetch decks and default to first deck for initial load
  const { data: decks, isLoading: decksLoading, error: decksError } = useDecks();
  const selectedDeckId = decks?.[0]?.id || 1;
  const { data: cards, isLoading: cardsLoading, error: cardsError } = useDeckCards(selectedDeckId);

  // Navigation handlers
  const handleStartTest = () => {
    navigate(`/study/${selectedDeckId}`);
  };

  const handleViewReview = () => {
    // Navigate to study session with review mode
    navigate(`/study/${selectedDeckId}?mode=review`);
  };

  const handleDeckChange = (deckId: number) => {
    // For now, we'll just refresh with the new deck
    // In a more sophisticated implementation, we could update the URL or state
    window.location.href = `/dashboard?deck=${deckId}`;
  };

  // Show loading state
  if (decksLoading || cardsLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (decksError || cardsError) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
          <p className="mb-4">
            {decksError?.message || cardsError?.message || 'Failed to load dashboard data'}
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
      flashcards={cards || []}
      onStartTest={handleStartTest}
      onViewReview={handleViewReview}
      decks={decks}
      selectedDeckId={selectedDeckId}
      onDeckChange={handleDeckChange}
    />
  );
};

export default Dashboard;