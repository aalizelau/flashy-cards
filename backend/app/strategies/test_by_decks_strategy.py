from typing import List
from app.strategies.test_strategy_interface import TestStrategyInterface
from app.models import Card, User
import random


class TestByDecksStrategy(TestStrategyInterface):
    def get_cards(self, user_id: str, deck_ids: List[int] = None, limit: int = 20) -> List[Card]:
        if not deck_ids:
            return []
        
        # Get user's selected language
        user = self.db.query(User).filter(User.uid == user_id).first()
        user_language = user.selected_language if user and user.selected_language else 'en'
        
        from app.models import Deck
        cards = self.db.query(Card).join(Deck).filter(
            Deck.user_id == user_id,
            Deck.language == user_language,
            Card.deck_id.in_(deck_ids)
        ).all()
        random.shuffle(cards)
        return cards[:limit]
    
    def get_stats(self, user_id: str, deck_ids: List[int] = None) -> dict:
        if not deck_ids:
            return {"available_cards": 0, "total_decks": None, "newly_added_count": 0, "unfamiliar_count": 0, "total_cards": 0}

        # Get user's selected language
        user = self.db.query(User).filter(User.uid == user_id).first()
        user_language = user.selected_language if user and user.selected_language else 'en'

        from app.models import Deck
        base_query = self.db.query(Card).join(Deck).filter(
            Deck.user_id == user_id,
            Deck.language == user_language,
            Card.deck_id.in_(deck_ids)
        )

        available_cards = base_query.count()
        newly_added_count = base_query.filter(Card.total_attempts == 0).count()
        unfamiliar_count = base_query.filter(Card.accuracy < 0.5).count()

        return {
            "available_cards": available_cards,
            "total_decks": None,
            "newly_added_count": newly_added_count,
            "unfamiliar_count": unfamiliar_count,
            "total_cards": available_cards
        }