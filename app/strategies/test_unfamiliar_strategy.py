from typing import List
from app.strategies.test_strategy_interface import TestStrategyInterface
from app.models import Card
import random


class TestUnfamiliarStrategy(TestStrategyInterface):
    def get_cards(self, deck_ids: List[int] = None, limit: int = 20) -> List[Card]:
        query = self.db.query(Card).filter(Card.accuracy < 0.5)
        
        if deck_ids:
            query = query.filter(Card.deck_id.in_(deck_ids))
        
        cards = query.all()
        random.shuffle(cards)
        return cards[:limit]