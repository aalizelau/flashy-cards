from typing import List
from app.strategies.test_strategy_interface import TestStrategyInterface
from app.models import Card, User
import random


class TestNewlyAddedStrategy(TestStrategyInterface):
    def get_cards(self, user_id: str, deck_ids: List[int] = None, limit: int = 20) -> List[Card]:
        # Get user's selected language
        user = self.db.query(User).filter(User.uid == user_id).first()
        user_language = user.selected_language if user and user.selected_language else 'en'
        
        from app.models import Deck
        query = self.db.query(Card).join(Deck).filter(
            Deck.user_id == user_id,
            Deck.language == user_language,
            Card.total_attempts == 0
        )
        
        if deck_ids:
            query = query.filter(Card.deck_id.in_(deck_ids))
        
        cards = query.all()
        random.shuffle(cards)
        return cards[:limit]
    
    def get_stats(self, user_id: str, deck_ids: List[int] = None) -> dict:
        # Get user's selected language
        user = self.db.query(User).filter(User.uid == user_id).first()
        user_language = user.selected_language if user and user.selected_language else 'en'

        from app.models import Deck
        newly_added_query = self.db.query(Card).join(Deck).filter(
            Deck.user_id == user_id,
            Deck.language == user_language,
            Card.total_attempts == 0
        )

        base_query = self.db.query(Card).join(Deck).filter(
            Deck.user_id == user_id,
            Deck.language == user_language
        )

        if deck_ids:
            newly_added_query = newly_added_query.filter(Card.deck_id.in_(deck_ids))
            base_query = base_query.filter(Card.deck_id.in_(deck_ids))

        available_cards = newly_added_query.count()
        total_cards = base_query.count()
        unfamiliar_count = base_query.filter(Card.accuracy < 0.5).count()

        return {
            "available_cards": available_cards,
            "total_decks": None,
            "newly_added_count": available_cards,
            "unfamiliar_count": unfamiliar_count,
            "total_cards": total_cards
        }