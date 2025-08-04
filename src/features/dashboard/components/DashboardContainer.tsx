import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainDashboard } from './MainDashboard';
import { useDecks, useAnalytics } from '@/shared/hooks/useApi';
import { TestConfigModal } from '@/features/test/components/Popup';

const DashboardContainer: React.FC = () => {
  const navigate = useNavigate();
  const [showTestConfig, setShowTestConfig] = useState(false);
  
  const { data: decks, isLoading: decksLoading, error: decksError } = useDecks();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAnalytics();
  
  const selectedDeckId = decks?.[0]?.id || 1;
  const selectedDeck = decks?.find(deck => deck.id === selectedDeckId);

  const handleStartTest = () => {
    setShowTestConfig(true);
  };

  const handleTestStart = (wordCount: number) => {
    setShowTestConfig(false);
    navigate(`/test/${selectedDeckId}?words=${wordCount}`);
  };

  const handleTestConfigClose = () => {
    setShowTestConfig(false);
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
    <>
      <MainDashboard
        onStartTest={handleStartTest}
        analytics={analytics}
      />
      {showTestConfig && selectedDeck && (
        <TestConfigModal
          deck={selectedDeck}
          onStart={handleTestStart}
          onClose={handleTestConfigClose}
        />
      )}
    </>
  );
};

export default DashboardContainer;