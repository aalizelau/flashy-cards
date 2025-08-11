from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.database import SessionLocal
from app.schemas import TestAnalytics
from app.models import TestAnalytics as TestAnalyticsORM, Card as CardORM, Deck as DeckORM, User as UserORM
from app.auth_middleware import get_current_user
from app.user_service import UserService

router = APIRouter(prefix="/analytics", tags=["analytics"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=TestAnalytics)
def get_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_id = current_user["uid"]
    
    # Ensure user exists in database
    user_service = UserService(db)
    user_service.get_or_create_user(current_user["firebase_token"])
    
    # Get user's selected language
    user = db.query(UserORM).filter(UserORM.uid == user_id).first()
    user_language = user.selected_language if user and user.selected_language else 'en'
    
    # Calculate real-time language-specific analytics
    user_cards_query = db.query(CardORM).join(DeckORM).filter(
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
    
    return TestAnalytics(
        total_cards_studied=total_cards_studied,
        total_correct_answers=int(total_correct_answers),
        cards_mastered=cards_mastered,
        overall_average_progress=round(overall_average_progress, 2),
        updated_at=datetime.utcnow()
    )