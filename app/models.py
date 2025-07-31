from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime


class Deck(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime
    card_count: int


class Card(BaseModel):
    id: int
    deck_id: int
    front: str
    back: str
    accuracy: float = 0.0
    total_attempts: int = 0
    correct_answers: int = 0
    last_reviewed_at: Optional[datetime] = None
    created_at: datetime


class StudySession(BaseModel):
    deck_id: int
    started_at: datetime


class SessionSummary(BaseModel):
    total_cards: int
    passed_count: int
    missed_count: int
    accuracy_percentage: float


class SessionComplete(BaseModel):
    deck_id: int
    passed_words: List[int]  # List of card IDs that were correct
    missed_words: List[int]  # List of card IDs that were incorrect
    summary: SessionSummary
    completed_at: datetime


class TestResult(BaseModel):
    card_id: str
    remembered: bool


class TestResults(BaseModel):
    deck_id: int
    test_results: List[TestResult]


class Analytics(BaseModel):
    total_decks: int
    total_cards: int
    total_cards_studied: int  # unique cards studied
    total_correct_answers: int  # non-unique correct answers
    cards_mastered: int
    overall_average_progress: float  # overall average accuracy percentage