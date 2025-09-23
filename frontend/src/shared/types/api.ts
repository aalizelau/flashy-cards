// API-based TypeScript interfaces matching the backend API

// User and Authentication Types
export interface User {
  uid: string;
  email: string | null;
  firstName: string | null;
}

// Backend User Profile (separate from Firebase User)
export interface UserProfile {
  uid: string;
  email: string;
  name: string | null;
  selected_language: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthenticatedUser extends User {
  accessToken: string;
  isEmailVerified: boolean;
}

export interface CustomField {
  name: string;
  label: string;
}

export interface Deck {
  id: number;
  name: string;
  is_public: boolean;
  created_at: string;
  last_modified: string;
  progress: number;
  card_count: number;
  original_author_name?: string;
  custom_fields?: CustomField[];
}

export interface Card {
  id: number;
  deck_id: number;
  front: string;
  back: string;
  example_sentence_1?: string;
  sentence_translation_1?: string;
  example_sentence_2?: string;
  sentence_translation_2?: string;
  accuracy: number;
  total_attempts: number;
  correct_answers: number;
  last_reviewed_at: string;
  created_at: string;
  audio_url?: string;
  custom_data?: { [fieldName: string]: string };
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
  card_id: number;
  remembered: boolean;
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

export interface TestAnalytics {
  total_cards_studied: number;
  total_correct_answers: number;
  cards_mastered: number;
  overall_average_progress: number;
}

export interface CardCreate {
  id?: number;
  front: string;
  back: string;
  example_sentence_1?: string;
  sentence_translation_1?: string;
  example_sentence_2?: string;
  sentence_translation_2?: string;
  custom_data?: { [fieldName: string]: string };
}

export interface DeckWithCardsCreate {
  name: string;
  is_public?: boolean;
  custom_fields?: CustomField[];
  cards: CardCreate[];
}

export interface DeckWithCardsResponse {
  id: number;
  name: string;
  is_public: boolean;
  created_at: string;
  progress: number;
  card_count: number;
  custom_fields?: CustomField[];
  cards: Card[];
}

export interface TestStats {
  available_cards: number;
  total_decks: number | null;
  newly_added_count?: number;
  unfamiliar_count?: number;
  total_cards?: number;
}

export interface StudySessionRequest {
  test_type: 'test_all' | 'test_by_decks' | 'test_unfamiliar' | 'test_newly_added';
  deck_ids?: number[];
  limit: number;
  threshold?: number;
}

export interface PublicDeck {
  id: number;
  name: string;
  language: string;
  card_count: number;
  author_name: string;
  created_at: string;
  last_modified?: string;
  is_public: boolean;
}