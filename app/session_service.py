from datetime import datetime
from typing import List

from sqlalchemy.orm import Session

from app.models import Card, SessionComplete, SessionSummary, TestResults
from app.db_models import StudySession as StudySessionORM, Card as CardORM
from app.schemas import StudySession, Card as CardSchema
from fastapi import HTTPException
import random

class SessionService:
    def __init__(self, db: Session):
        self.db = db

    def create_study_session(self, deck_id: int) -> StudySession:
        cards = self.db.query(CardORM).filter(CardORM.deck_id == deck_id).all()
        if not cards:
            raise HTTPException(status_code=404, detail="Deck not found or has no cards")
        
        # Shuffle cards for randomness
        random.shuffle(cards)
        
        # Convert ORM models to Pydantic models
        card_models = [CardSchema.model_validate(card) for card in cards]

        return StudySession(
            deck_id=deck_id,
            started_at=datetime.now(),
            cards=card_models  
        )

    def complete_session(self, test_results: TestResults) -> SessionComplete:
        passed = []
        missed = []

        for result in test_results.test_results:
            card = self.db.query(Card).filter(Card.id == result.card_id).first()
            if not card:
                continue  
            self._update_card(card, result.remembered)
            
            if result.remembered:
                passed.append(card.id)
            else:
                missed.append(card.id)

        completed_at = datetime.now()
        summary = SessionSummary(
            total_cards=len(test_results.test_results),
            passed_count=len(passed),
            missed_count=len(missed),
            accuracy_percentage=round((len(passed) / len(test_results.test_results)) * 100, 2) if test_results.test_results else 0
        )

        session_data = SessionComplete(
            deck_id=test_results.deck_id,
            passed_words=passed,
            missed_words=missed,
            summary=summary,
            completed_at=completed_at
        )

        self._record_session_history(session_data)
        self.db.commit()
        return {"message": "Session completed successfully"}    

    def _update_card(self, card: Card, remembered: bool):
        prev_correct = int(card.accuracy * card.total_attempts)
        new_total = card.total_attempts + 1
        new_correct = prev_correct + (1 if remembered else 0)

        card.total_attempts = new_total
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
