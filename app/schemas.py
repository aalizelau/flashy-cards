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
