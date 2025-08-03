from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from typing import List

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

class StudySession(BaseModel):
    deck_id: int
    started_at: datetime
    cards: List[Card]

class CreateSessionRequest(BaseModel):
    deck_id: int

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

class DeckBase(BaseModel):
    name: str


class DeckOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    progress: float
    card_count: int

    class Config:
        orm_mode = True  # ✅ Needed to allow returning SQLAlchemy models
