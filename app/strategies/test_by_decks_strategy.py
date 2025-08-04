from typing import List
from app.strategies.test_strategy_interface import TestStrategyInterface
from app.models import Card
import random


class TestByDecksStrategy(TestStrategyInterface):
    def get_cards(self, deck_ids: List[int] = None, limit: int = 20) -> List[Card]:
        if not deck_ids:
            return []
        
        cards = self.db.query(Card).filter(Card.deck_id.in_(deck_ids)).all()
        random.shuffle(cards)
        return cards[:limit]