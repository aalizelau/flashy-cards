from pydantic import BaseModel
from datetime import datetime
from typing import Optional


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
