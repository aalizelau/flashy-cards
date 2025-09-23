from typing import List
from app.strategies.test_strategy_interface import TestStrategyInterface
from app.models import Card, User
import random


class TestUnfamiliarStrategy(TestStrategyInterface):
    def get_cards(self, user_id: str, deck_ids: List[int] = None, limit: int = 20, threshold: float = None) -> List[Card]:
        # Get user's selected language
        user = self.db.query(User).filter(User.uid == user_id).first()
        user_language = user.selected_language if user and user.selected_language else 'en'

        # Use provided threshold or default to 0.5 (50%)
        accuracy_threshold = threshold if threshold is not None else 0.5

        from app.models import Deck
        query = self.db.query(Card).join(Deck).filter(
            Deck.user_id == user_id,
            Deck.language == user_language,
            Card.accuracy < accuracy_threshold
        )

        if deck_ids:
            query = query.filter(Card.deck_id.in_(deck_ids))

        cards = query.all()
        random.shuffle(cards)
        return cards[:limit]
    
    def get_stats(self, user_id: str, deck_ids: List[int] = None, threshold: float = None) -> dict:
        # Get user's selected language
        user = self.db.query(User).filter(User.uid == user_id).first()
        user_language = user.selected_language if user and user.selected_language else 'en'

        # Use provided threshold or default to 0.5 (50%)
        accuracy_threshold = threshold if threshold is not None else 0.5

        from app.models import Deck
        unfamiliar_query = self.db.query(Card).join(Deck).filter(
            Deck.user_id == user_id,
            Deck.language == user_language,
            Card.accuracy < accuracy_threshold
        )

        base_query = self.db.query(Card).join(Deck).filter(
            Deck.user_id == user_id,
            Deck.language == user_language
        )

        if deck_ids:
            unfamiliar_query = unfamiliar_query.filter(Card.deck_id.in_(deck_ids))
            base_query = base_query.filter(Card.deck_id.in_(deck_ids))

        available_cards = unfamiliar_query.count()
        total_cards = base_query.count()
        newly_added_count = base_query.filter(Card.total_attempts == 0).count()

        return {
            "available_cards": available_cards,
            "total_decks": None,
            "newly_added_count": newly_added_count,
            "unfamiliar_count": available_cards,
            "total_cards": total_cards
        }