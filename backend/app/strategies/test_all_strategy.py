from typing import List
from app.strategies.test_strategy_interface import TestStrategyInterface
from app.models import Card, Deck
import random


class TestAllStrategy(TestStrategyInterface):
    def get_cards(self, user_id: str, deck_ids: List[int] = None, limit: int = 20) -> List[Card]:
        query = self.db.query(Card).join(Deck).filter(Deck.user_id == user_id)
        cards = query.all()
        random.shuffle(cards)
        return cards[:limit]
    
    def get_stats(self, user_id: str, deck_ids: List[int] = None) -> dict:
        available_cards = self.db.query(Card).join(Deck).filter(Deck.user_id == user_id).count()
        total_decks = self.db.query(Deck).filter(Deck.user_id == user_id).count()
        return {
            "available_cards": available_cards,
            "total_decks": total_decks
        }