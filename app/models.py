from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum


class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


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
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    created_at: datetime


class SessionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"


class StudySession(BaseModel):
    id: int
    deck_id: int
    started_at: datetime
    status: SessionStatus = SessionStatus.ACTIVE


class SessionCard(BaseModel):
    session_id: int
    card_id: int
    shown_at: datetime
    response: Optional[DifficultyLevel] = None


class SessionComplete(BaseModel):
    session_id: int
    completed_cards: List[SessionCard]


class Analytics(BaseModel):
    total_decks: int
    total_cards: int
    total_sessions: int
    completed_sessions: int
    cards_studied_today: int
    average_session_duration_minutes: float