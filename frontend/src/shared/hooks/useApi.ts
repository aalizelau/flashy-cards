import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/services/api';
import { StudySessionComplete, StudySessionRequest, CardCreate } from '@/shared/types/api';

// Query keys for caching
export const queryKeys = {
  decks: ['decks'] as const,
  deckCards: (deckId: number) => ['decks', deckId, 'cards'] as const,
  analytics: ['analytics'] as const,
  userProfile: ['userProfile'] as const,
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

// Get all cards from all user's decks
export const useAllUserCards = () => {
  return useQuery({
    queryKey: ['all-user-cards'],
    queryFn: () => apiClient.getAllUserCards(),
  });
};

// Get analytics
export const useAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: () => apiClient.getAnalytics(),
  });
};

// Start study session mutation (legacy)
export const useStartStudySession = () => {
  return useMutation({
    mutationFn: (deckId: number) => apiClient.startStudySession(deckId),
  });
};

// Start test session mutation (new)
export const useStartTestSession = () => {
  return useMutation({
    mutationFn: (sessionRequest: StudySessionRequest) => apiClient.startTestSession(sessionRequest),
  });
};

// Complete study session mutation
export const useCompleteStudySession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionData: StudySessionComplete[]) => 
      apiClient.completeStudySession(sessionData),
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      queryClient.invalidateQueries({ queryKey: queryKeys.decks });
    },
  });
};

// Get user profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.userProfile,
    queryFn: () => apiClient.getUserProfile(),
  });
};

// Delete deck mutation
export const useDeleteDeck = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (deckId: number) => apiClient.deleteDeck(deckId),
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.decks });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
};

// Add card to deck mutation
export const useAddCardToDeck = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ deckId, cardData }: { deckId: number; cardData: CardCreate }) => 
      apiClient.addCardToDeck(deckId, cardData),
    onSuccess: (data, variables) => {
      // Invalidate the specific deck's cards query to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.deckCards(variables.deckId) });
      // Also invalidate decks query to update card counts
      queryClient.invalidateQueries({ queryKey: queryKeys.decks });
    },
  });
};

// Update card mutation
export const useUpdateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ deckId, cardId, cardData }: { deckId: number; cardId: number; cardData: CardCreate }) => 
      apiClient.updateCard(deckId, cardId, cardData),
    onSuccess: (data, variables) => {
      // Invalidate the specific deck's cards query to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.deckCards(variables.deckId) });
      // Also invalidate all user cards query
      queryClient.invalidateQueries({ queryKey: ['all-user-cards'] });
    },
  });
};