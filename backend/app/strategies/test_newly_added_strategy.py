from typing import List
from app.strategies.test_strategy_interface import TestStrategyInterface
from app.models import Card
import random


class TestNewlyAddedStrategy(TestStrategyInterface):
    def get_cards(self, user_id: str, deck_ids: List[int] = None, limit: int = 20) -> List[Card]:
        from app.models import Deck
        query = self.db.query(Card).join(Deck).filter(
            Deck.user_id == user_id,
            Card.total_attempts == 0
        )
        
        if deck_ids:
            query = query.filter(Card.deck_id.in_(deck_ids))
        
        cards = query.all()
        random.shuffle(cards)
        return cards[:limit]
    
    def get_stats(self, user_id: str, deck_ids: List[int] = None) -> dict:
        from app.models import Deck
        query = self.db.query(Card).join(Deck).filter(
            Deck.user_id == user_id,
            Card.total_attempts == 0
        )
        
        if deck_ids:
            query = query.filter(Card.deck_id.in_(deck_ids))
        
        available_cards = query.count()
        return {
            "available_cards": available_cards,
            "total_decks": None
        }