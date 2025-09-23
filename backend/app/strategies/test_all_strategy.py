from typing import List
from app.strategies.test_strategy_interface import TestStrategyInterface
from app.models import Card, Deck, User
import random


class TestAllStrategy(TestStrategyInterface):
    def get_cards(self, user_id: str, deck_ids: List[int] = None, limit: int = 20, threshold: float = None) -> List[Card]:
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
    
    def get_stats(self, user_id: str, deck_ids: List[int] = None, threshold: float = None) -> dict:
        # Get user's selected language
        user = self.db.query(User).filter(User.uid == user_id).first()
        user_language = user.selected_language if user and user.selected_language else 'en'

        base_query = self.db.query(Card).join(Deck).filter(
            Deck.user_id == user_id,
            Deck.language == user_language
        )

        available_cards = base_query.count()
        total_decks = self.db.query(Deck).filter(
            Deck.user_id == user_id,
            Deck.language == user_language
        ).count()

        # Calculate additional counts
        # Use provided threshold or default to 0.5 (50%) for unfamiliar count
        accuracy_threshold = threshold if threshold is not None else 0.5
        newly_added_count = base_query.filter(Card.total_attempts == 0).count()
        unfamiliar_count = base_query.filter(Card.accuracy < accuracy_threshold).count()

        return {
            "available_cards": available_cards,
            "total_decks": total_decks,
            "newly_added_count": newly_added_count,
            "unfamiliar_count": unfamiliar_count,
            "total_cards": available_cards
        }