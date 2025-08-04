from typing import List
from app.strategies.test_strategy_interface import TestStrategyInterface
from app.models import Card
import random


class TestAllStrategy(TestStrategyInterface):
    def get_cards(self, deck_ids: List[int] = None, limit: int = 20) -> List[Card]:
        cards = self.db.query(Card).all()
        random.shuffle(cards)
        return cards[:limit]