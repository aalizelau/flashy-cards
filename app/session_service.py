from datetime import datetime
from typing import List

from sqlalchemy.orm import Session

from app.models import Card, SessionComplete, SessionSummary, TestResults
from app.db_models import StudySession 
from fastapi import HTTPException

class SessionService:
    def __init__(self, db: Session):
        self.db = db

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
