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
  StudySessionRequest
} from '@/shared/types/api';

const BASE_URL = 'http://localhost:8000';

class ApiClient {
  private async request<T>(
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
}

export const apiClient = new ApiClient();