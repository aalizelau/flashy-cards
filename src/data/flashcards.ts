// API-based TypeScript interfaces matching the backend API

export interface Deck {
  id: number;
  name: string;
  created_at: string;
  progress: number;
  card_count: number;
}

export interface Card {
  id: number;
  deck_id: number;
  front: string;
  back: string;
  accuracy: number;
  total_attempts: number;
  correct_answers: number;
  last_reviewed_at: string;
  created_at: string;
}

export interface TestResult {
  card_id: number;
  front: string;
  back: string;
  remembered: boolean;
}

export interface StudySession {
  deck_id: number;
  started_at: string;
  cards: Card[];
}

export interface StudySessionComplete {
  deck_id: number;
  test_results: TestResult[];
}

export interface SessionSummary {
  total_cards: number;
  passed_count: number;
  missed_count: number;
  accuracy_percentage: number;
}

export interface StudySessionResponse {
  deck_id: number;
  passed_words: number[];
  missed_words: number[];
  summary: SessionSummary;
  completed_at: string;
}

export interface Analytics {
  total_decks: number;
  total_cards: number;
  total_cards_studied: number;
  total_correct_answers: number;
  cards_mastered: number;
  overall_average_progress: number;
}

