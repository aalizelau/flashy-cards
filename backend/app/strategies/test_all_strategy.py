from typing import List
from app.strategies.test_strategy_interface import TestStrategyInterface
from app.models import Card, Deck, User
import random


class TestAllStrategy(TestStrategyInterface):
    def get_cards(self, user_id: str, deck_ids: List[int] = None, limit: int = 20) -> List[Card]:
        # Get user's selected language
        user = self.db.query(User).filter(User.uid == user_id).first()
        user_language = user.selected_language if user and user.selected_language else 'en'
        
        query = self.db.query(Card).join(Deck).filter(
            Deck.user_id == user_id,
            Deck.language == user_language
        )
        cards = query.all()
        random.shuffle(cards)
        return cards[:limit]
    
    def get_stats(self, user_id: str, deck_ids: List[int] = None) -> dict:
        # Get user's selected language
        user = self.db.query(User).filter(User.uid == user_id).first()
        user_language = user.selected_language if user and user.selected_language else 'en'
        
        available_cards = self.db.query(Card).join(Deck).filter(
            Deck.user_id == user_id,
            Deck.language == user_language
        ).count()
        total_decks = self.db.query(Deck).filter(
            Deck.user_id == user_id,
            Deck.language == user_language
        ).count()
        return {
            "available_cards": available_cards,
            "total_decks": total_decks
        }