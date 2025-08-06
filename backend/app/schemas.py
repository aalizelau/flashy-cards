from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from typing import List

class User(BaseModel):
    uid: str
    email: str
    name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class UserCreate(BaseModel):
    uid: str
    email: str
    name: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None

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
    model_config = {"from_attributes": True}

class DeckBase(BaseModel):
    name: str


class DeckCreate(DeckBase):
    pass


class DeckOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    progress: float
    card_count: int

    class Config:
        orm_mode = True


class CardCreate(BaseModel):
    front: str
    back: str


class DeckWithCardsCreate(BaseModel):
    name: str
    cards: List[CardCreate]


class DeckWithCardsResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    progress: float
    card_count: int
    cards: List[Card]

    class Config:
        orm_mode = True 

class StudySession(BaseModel):
    deck_id: int
    started_at: datetime
    cards: List[Card]

class CreateSessionRequest(BaseModel):
    test_type: str
    deck_ids: Optional[List[int]] = None
    limit: int

class TestResult(BaseModel):
    card_id: int
    remembered: bool

class TestAnalytics(BaseModel):
    total_cards_studied: int
    total_correct_answers: int
    cards_mastered: int
    overall_average_progress: float
    updated_at: datetime | None = None

    class Config:
        orm_mode = True 

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

class TestStats(BaseModel):
    available_cards: int
    total_decks: Optional[int] = None