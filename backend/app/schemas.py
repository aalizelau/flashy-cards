from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
from typing import List

class User(BaseModel):
    uid: str
    email: str
    name: Optional[str] = None
    selected_language: Optional[str] = 'en'
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class UserCreate(BaseModel):
    uid: str
    email: str
    name: Optional[str] = None
    selected_language: Optional[str] = 'en'

class UserUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    selected_language: Optional[str] = None


class CustomField(BaseModel):
    name: str
    label: str

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
    audio_url: Optional[str] = None  # Will be populated by API
    custom_data: Optional[Dict[str, str]] = None
    model_config = {"from_attributes": True}

class DeckBase(BaseModel):
    name: str
    is_public: bool = False


class DeckCreate(DeckBase):
    custom_fields: Optional[List[CustomField]] = None


class DeckOut(BaseModel):
    id: int
    name: str
    is_public: bool
    created_at: datetime
    last_modified: datetime
    progress: float
    card_count: int
    original_author_name: Optional[str] = None
    custom_fields: Optional[List[CustomField]] = None

    class Config:
        orm_mode = True


class PublicDeckOut(BaseModel):
    id: int
    name: str
    language: str
    card_count: int
    author_name: str
    created_at: datetime
    last_modified: Optional[datetime] = None
    is_public: bool = True

    class Config:
        orm_mode = True


class CardCreate(BaseModel):
    id: Optional[int] = None
    front: str
    back: str
    custom_data: Optional[Dict[str, str]] = None


class DeckWithCardsCreate(BaseModel):
    name: str
    is_public: bool = False
    custom_fields: Optional[List[CustomField]] = None
    cards: List[CardCreate]


class DeckWithCardsResponse(BaseModel):
    id: int
    name: str
    is_public: bool
    created_at: datetime
    last_modified: datetime
    progress: float
    card_count: int
    custom_fields: Optional[List[CustomField]] = None
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
    threshold: Optional[float] = None

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
    newly_added_count: Optional[int] = None
    unfamiliar_count: Optional[int] = None
    total_cards: Optional[int] = None

class CopyPublicDeckRequest(BaseModel):
    public_deck_id: int