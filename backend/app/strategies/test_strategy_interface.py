from abc import ABC, abstractmethod
from typing import List
from sqlalchemy.orm import Session
from app.models import Card


class TestStrategyInterface(ABC):
    def __init__(self, db: Session):
        self.db = db
    
    @abstractmethod
    def get_cards(self, user_id: str, deck_ids: List[int] = None, limit: int = 20, threshold: float = None) -> List[Card]:
        pass

    @abstractmethod
    def get_stats(self, user_id: str, deck_ids: List[int] = None, threshold: float = None) -> dict:
        pass