from typing import List
from app.strategies.test_strategy_interface import TestStrategyInterface
from app.models import Card
import random


class TestNewlyAddedStrategy(TestStrategyInterface):
    def get_cards(self, deck_ids: List[int] = None, limit: int = 20) -> List[Card]:
        query = self.db.query(Card).filter(Card.total_attempts == 0)
        
        if deck_ids:
            query = query.filter(Card.deck_id.in_(deck_ids))
        
        cards = query.all()
        random.shuffle(cards)
        return cards[:limit]
    
    def get_stats(self, deck_ids: List[int] = None) -> dict:
        query = self.db.query(Card).filter(Card.total_attempts == 0)
        
        if deck_ids:
            query = query.filter(Card.deck_id.in_(deck_ids))
        
        available_cards = query.count()
        return {
            "available_cards": available_cards,
            "total_decks": None
        }