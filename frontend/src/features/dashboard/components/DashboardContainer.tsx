import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainDashboard } from './MainDashboard';
import { useDecks, useAnalytics } from '@/shared/hooks/useApi';
import { TestConfigModal } from '@/features/test/components/Popup';
import { DeckSelectionModal } from '@/features/test/components/DeckSelectionModal';
import { apiClient } from '@/shared/services/api';
import { TestStats } from '@/shared/types/api';

const DashboardContainer: React.FC = () => {
  const navigate = useNavigate();
  const [showTestConfig, setShowTestConfig] = useState(false);
  const [showDeckSelection, setShowDeckSelection] = useState(false);
  const [testStats, setTestStats] = useState<TestStats | null>(null);
  const [currentTestType, setCurrentTestType] = useState<string>('');
  const [selectedDeckIds, setSelectedDeckIds] = useState<number[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  const { data: decks, isLoading: decksLoading, error: decksError } = useDecks();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAnalytics();
  
  const selectedDeckId = decks?.[0]?.id || 1;
  const selectedDeck = decks?.find(deck => deck.id === selectedDeckId);

  const handleStartTest = async (testType: string) => {
    // Skip daily challenge for now as per requirements
    if (testType === 'daily_challenge') {
      return;
    }
    
    setCurrentTestType(testType);
    
    // For test_by_decks, show deck selection modal first
    if (testType === 'test_by_decks') {
      setShowDeckSelection(true);
      return;
    }
    
    // For other test types, proceed directly to stats fetching
    await fetchStatsAndShowConfig(testType);
  };
  
  const fetchStatsAndShowConfig = async (testType: string, deckIds?: number[]) => {
    setIsLoadingStats(true);
    
    try {
      const stats = await apiClient.getTestStats(testType, deckIds);
      setTestStats(stats);
      setShowTestConfig(true);
    } catch (error) {
      console.error('Failed to fetch test stats:', error);
      // Show modal anyway with fallback behavior
      setTestStats(null);
      setShowTestConfig(true);
    } finally {
      setIsLoadingStats(false);
    }
  };
  
  const handleDeckSelectionContinue = async (deckIds: number[]) => {
    setSelectedDeckIds(deckIds);
    setShowDeckSelection(false);
    await fetchStatsAndShowConfig('test_by_decks', deckIds);
  };

  const handleTestStart = (wordCount: number, swapSides: boolean) => {
    setShowTestConfig(false);

    // Build URL with test parameters
    const params = new URLSearchParams({
      type: currentTestType,
      limit: wordCount.toString()
    });

    // Add deck_ids for test_by_decks
    if (currentTestType === 'test_by_decks' && selectedDeckIds.length > 0) {
      params.set('deck_ids', selectedDeckIds.join(','));
    }

    // Add swap parameter
    if (swapSides) {
      params.set('swap', 'true');
    }

    // Add default threshold for unfamiliar cards (50% since dashboard doesn't have threshold UI)
    if (currentTestType === 'test_unfamiliar') {
      params.set('threshold', '50');
    }

    navigate(`/test?${params.toString()}`);
  };

  const handleTestConfigClose = () => {
    setShowTestConfig(false);
    setTestStats(null);
    setCurrentTestType('');
    setSelectedDeckIds([]);
  };
  
  const handleDeckSelectionClose = () => {
    setShowDeckSelection(false);
    setCurrentTestType('');
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
      {showDeckSelection && decks && (
        <DeckSelectionModal
          decks={decks}
          onContinue={handleDeckSelectionContinue}
          onClose={handleDeckSelectionClose}
        />
      )}
      {showTestConfig && selectedDeck && (
        <TestConfigModal
          deck={selectedDeck}
          testStats={testStats}
          testType={currentTestType}
          onStart={handleTestStart}
          onClose={handleTestConfigClose}
        />
      )}
      {isLoadingStats && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-center">Loading test statistics...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardContainer;