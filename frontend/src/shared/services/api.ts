import {
  Deck,
  Card,
  StudySession,
  StudySessionComplete,
  StudySessionResponse,
  TestAnalytics,
  DeckWithCardsCreate,
  DeckWithCardsResponse,
  TestStats,
  StudySessionRequest,
  UserProfile,
  CardCreate,
  PublicDeck
} from '@/shared/types/api';
import { auth } from '@/features/auth/contexts/AuthContext';

const BASE_URL = import.meta.env.VITE_API_ADDRESS;

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    // Get authentication token
    let authHeaders = {};
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        authHeaders = {
          'Authorization': `Bearer ${token}`,
        };
      } else {
        throw new Error('User not authenticated');
      }
    } catch (error) {
      console.error('Failed to get auth token for API request:', error);
      throw new Error('Authentication required');
    }

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  private async publicRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Public API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Get all decks
  async getDecks(): Promise<Deck[]> {
    return this.request<Deck[]>('/decks');
  }

  // Get cards for a specific deck
  async getDeckCards(deckId: number): Promise<Card[]> {
    return this.request<Card[]>(`/decks/${deckId}/cards`);
  }

  // Get all cards from all user's decks
  async getAllUserCards(): Promise<Card[]> {
    return this.request<Card[]>('/decks/all/cards');
  }

  // Start a study session (legacy - single deck)
  async startStudySession(deckId: number): Promise<StudySession> {
    return this.request<StudySession>('/study/sessions', {
      method: 'POST',
      body: JSON.stringify({ deck_id: deckId }),
    });
  }

  // Start a study session with new test types
  async startTestSession(sessionRequest: StudySessionRequest): Promise<StudySession> {
    return this.request<StudySession>('/study/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionRequest),
    });
  }

  // Complete a study session
  async completeStudySession(
    sessionData: StudySessionComplete[]
  ): Promise<StudySessionResponse> {
    return this.request<StudySessionResponse>('/study/sessions/complete', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  // Get analytics data
  async getAnalytics(): Promise<TestAnalytics> {
    return this.request<TestAnalytics>('/analytics');
  }

  // Create deck with cards
  async createDeckWithCards(deckData: DeckWithCardsCreate): Promise<DeckWithCardsResponse> {
    return this.request<DeckWithCardsResponse>('/decks/with-cards', {
      method: 'POST',
      body: JSON.stringify(deckData),
    });
  }

  // Get test statistics
  async getTestStats(testType: string, deckIds?: number[]): Promise<TestStats> {
    let endpoint = `/study/test/${testType}/stats`;
    
    if (testType === 'test_by_decks' && deckIds && deckIds.length > 0) {
      const deckIdsParam = deckIds.join(',');
      endpoint += `?deck_ids=${deckIdsParam}`;
    }
    
    return this.request<TestStats>(endpoint);
  }

  // Get user profile
  async getUserProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/users/me');
  }

  // Update user profile
  async updateUserProfile(userData: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Delete deck
  async deleteDeck(deckId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/decks/${deckId}`, {
      method: 'DELETE',
    });
  }

  // Add card to deck
  async addCardToDeck(deckId: number, cardData: CardCreate): Promise<Card> {
    return this.request<Card>(`/decks/${deckId}/cards`, {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  }

  // Get deck by ID
  async getDeckById(deckId: number): Promise<Deck> {
    return this.request<Deck>(`/decks/${deckId}`);
  }

  // Patch deck with cards (preserves statistics)
  async patchDeckWithCards(deckId: number, deckData: DeckWithCardsCreate): Promise<DeckWithCardsResponse> {
    return this.request<DeckWithCardsResponse>(`/decks/${deckId}/with-cards`, {
      method: 'PATCH',
      body: JSON.stringify(deckData),
    });
  }

  // Update specific card in deck
  async updateCard(deckId: number, cardId: number, cardData: CardCreate): Promise<Card> {
    return this.request<Card>(`/decks/${deckId}/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(cardData),
    });
  }

  // Delete specific card from deck
  async deleteCard(deckId: number, cardId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/decks/${deckId}/cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  // Export all user data
  async exportAllData(): Promise<any> {
    return this.request<any>('/export/all');
  }

  // Import all user data (destructive)
  async importAllData(file: File): Promise<{ success: boolean; message: string; imported_decks: number; imported_cards: number }> {
    const formData = new FormData();
    formData.append('file', file);

    // Get authentication token
    let authHeaders = {};
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        authHeaders = {
          'Authorization': `Bearer ${token}`,
        };
      } else {
        throw new Error('User not authenticated');
      }
    } catch (error) {
      console.error('Failed to get auth token for API request:', error);
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/export/import`, {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed. Please login again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Delete user account and all associated data
  async deleteAccount(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/me', {
      method: 'DELETE',
    });
  }

  // Get public decks (no authentication required)
  async getPublicDecks(language?: string, search?: string): Promise<PublicDeck[]> {
    const params = new URLSearchParams();
    if (language && language !== 'All') {
      params.append('language', language.toLowerCase());
    }
    if (search) {
      params.append('search', search);
    }

    const queryString = params.toString();
    const endpoint = `/decks/public${queryString ? `?${queryString}` : ''}`;

    return this.publicRequest<PublicDeck[]>(endpoint);
  }

  // Get public deck cards (no authentication required)
  async getPublicDeckCards(deckId: number): Promise<Card[]> {
    return this.publicRequest<Card[]>(`/decks/public/${deckId}/cards`);
  }

  // Copy public deck to user's collection
  async copyPublicDeck(deckId: number): Promise<DeckWithCardsResponse> {
    return this.request<DeckWithCardsResponse>('/decks/copy-from-public', {
      method: 'POST',
      body: JSON.stringify({ public_deck_id: deckId }),
    });
  }
}

export const apiClient = new ApiClient();