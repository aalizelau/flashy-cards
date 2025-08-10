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
  UserProfile
} from '@/shared/types/api';
import { auth } from '@/features/auth/contexts/AuthContext';

const BASE_URL = 'http://localhost:8000';

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

  // Get all decks
  async getDecks(): Promise<Deck[]> {
    return this.request<Deck[]>('/decks');
  }

  // Get cards for a specific deck
  async getDeckCards(deckId: number): Promise<Card[]> {
    return this.request<Card[]>(`/decks/${deckId}/cards`);
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
}

export const apiClient = new ApiClient();