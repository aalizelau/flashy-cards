from datetime import datetime
from typing import List

from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import Request, HTTPException

from app.models import Card as CardORM, TestAnalytics as TestAnalyticsORM
from app.schemas import StudySession, Card as CardSchema, TestResult, SessionComplete, TestStats
from app.strategies.test_strategy_interface import TestStrategyInterface
from app.strategies.test_all_strategy import TestAllStrategy
from app.strategies.test_by_decks_strategy import TestByDecksStrategy
from app.strategies.test_unfamiliar_strategy import TestUnfamiliarStrategy
from app.strategies.test_newly_added_strategy import TestNewlyAddedStrategy
import random

class SessionService:
    def __init__(self, db: Session):
        self.db = db

    def _get_strategy(self, test_type: str) -> TestStrategyInterface:
        strategies = {
            "test_all": TestAllStrategy,
            "test_by_decks": TestByDecksStrategy,
            "test_unfamiliar": TestUnfamiliarStrategy,
            "test_newly_added": TestNewlyAddedStrategy
        }
        
        if test_type not in strategies:
            raise ValueError(f"Invalid test type: {test_type}")
        
        return strategies[test_type](self.db)
    
    def _populate_audio_urls(self, cards: List[CardORM], request: Request) -> List[CardSchema]:
        """Convert CardORM to Card schema with audio URLs"""
        result = []
        base_url = str(request.base_url).rstrip('/')
        
        for card in cards:
            # Convert to Card schema using from_attributes
            card_schema = CardSchema.model_validate(card)
            # Add the audio_url field
            card_schema.audio_url = f"{base_url}/audio/{card.audio_path.replace('voices/', '')}" if card.audio_path else None
            result.append(card_schema)
        
        return result
    
    def create_study_session(self, test_type: str, user_id: str, request: Request, deck_ids: List[int] = None, limit: int = 20) -> StudySession:
        strategy = self._get_strategy(test_type)
        cards = strategy.get_cards(user_id, deck_ids, limit)
        
        if not cards:
            raise HTTPException(status_code=404, detail="No cards found for the specified criteria")
        
        # Convert ORM models to Pydantic models with audio URLs
        card_models = self._populate_audio_urls(cards, request)

        # Use the first deck_id if available, otherwise use 0 as placeholder
        deck_id = deck_ids[0] if deck_ids and len(deck_ids) > 0 else 0
        
        return StudySession(
            deck_id=deck_id,
            started_at=datetime.now(),
            cards=card_models  
        )
    
    def get_test_stats(self, test_type: str, user_id: str, deck_ids: List[int] = None) -> TestStats:
        strategy = self._get_strategy(test_type)
        stats = strategy.get_stats(user_id, deck_ids)
        return TestStats(
            available_cards=stats["available_cards"],
            total_decks=stats.get("total_decks")
        )

    def complete_session(self, results: List[TestResult]) :
        passed = []
        missed = []

        for result in results:
            card = self.db.query(CardORM).filter(CardORM.id == result.card_id).first()
            if not card:
                continue  
            self._update_card(card, result.remembered)
            
            # if result.remembered:
            #     passed.append(card.id)
            # else:
            #     missed.append(card.id)

        # completed_at = datetime.now()
        # summary = SessionSummary(
        #     total_cards=len(test_results.test_results),
        #     passed_count=len(passed),
        #     missed_count=len(missed),
        #     accuracy_percentage=round((len(passed) / len(test_results.test_results)) * 100, 2) if test_results.test_results else 0
        # )

        # session_data = SessionComplete(
        #     deck_id=test_results.deck_id,
        #     passed_words=passed,
        #     missed_words=missed,
        #     summary=summary,
        #     completed_at=completed_at
        # )

        # self._record_session_history(session_data)
        self.db.commit()
        return {"message": "Session completed successfully"}    

    def _update_card(self, card: CardSchema, remembered: bool):
        prev_correct = int(card.accuracy * card.total_attempts)
        new_total = card.total_attempts + 1
        new_correct = prev_correct + (1 if remembered else 0)

        card.total_attempts = new_total
        card.correct_answers = new_correct
        card.accuracy = new_correct / new_total
        card.last_reviewed_at = datetime.now()

    def _record_session_history(self, session: SessionComplete):
        new_session = StudySession(
            deck_id=session.deck_id,
            passed_words=session.passed_words,
            missed_words=session.missed_words,
            completed_at=session.completed_at
        )
        self.db.add(new_session)
    
    def update_analytics(self, user_id: str):
        from app.models import Deck as DeckORM, User as UserORM
        
        # Get user's selected language
        user = self.db.query(UserORM).filter(UserORM.uid == user_id).first()
        user_language = user.selected_language if user and user.selected_language else 'en'
        
        # Filter cards by user and language through deck relationship
        user_cards_query = self.db.query(CardORM).join(DeckORM).filter(
            DeckORM.user_id == user_id,
            DeckORM.language == user_language
        )
        
        total_cards_studied = user_cards_query.filter(CardORM.total_attempts > 0).count()
        total_correct_answers = user_cards_query.with_entities(
            func.sum(CardORM.accuracy * CardORM.total_attempts)
        ).scalar() or 0
        cards_mastered = user_cards_query.filter(CardORM.accuracy >= 0.9).count()
        overall_average_progress = (
            user_cards_query.with_entities(func.avg(CardORM.accuracy)).scalar() or 0.0
        )

        analytics_entry = TestAnalyticsORM(
            user_id=user_id,
            total_cards_studied=total_cards_studied,
            total_correct_answers=int(total_correct_answers),
            cards_mastered=cards_mastered,
            overall_average_progress=round(overall_average_progress, 2),
        )

        self.db.add(analytics_entry)
        self.db.commit()

