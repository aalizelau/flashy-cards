import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { StudySessionComplete } from '@/data/flashcards';

// Query keys for caching
export const queryKeys = {
  decks: ['decks'] as const,
  deckCards: (deckId: number) => ['decks', deckId, 'cards'] as const,
  analytics: ['analytics'] as const,
};

// Get all decks
export const useDecks = () => {
  return useQuery({
    queryKey: queryKeys.decks,
    queryFn: () => apiClient.getDecks(),
  });
};

// Get cards for a specific deck
export const useDeckCards = (deckId: number) => {
  return useQuery({
    queryKey: queryKeys.deckCards(deckId),
    queryFn: () => apiClient.getDeckCards(deckId),
    enabled: deckId > 0, // Only fetch if deckId is valid
  });
};

// Get analytics
export const useAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: () => apiClient.getAnalytics(),
  });
};

// Start study session mutation
export const useStartStudySession = () => {
  return useMutation({
    mutationFn: (deckId: number) => apiClient.startStudySession(deckId),
  });
};

// Complete study session mutation
export const useCompleteStudySession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionData: StudySessionComplete) => 
      apiClient.completeStudySession(sessionData),
    onSuccess: (data) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.deckCards(data.deck_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
};