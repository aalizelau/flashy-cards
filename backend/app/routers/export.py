from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from app.database import SessionLocal
from app import models, schemas
from app.auth_middleware import get_current_user
from app.user_service import UserService

router = APIRouter(prefix="/export", tags=["export"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ExportCard(schemas.Card):
    """Card schema for export without audio_url"""
    audio_url: Optional[str] = None
    
    class Config:
        exclude = {"audio_url"}

class ExportDeck(BaseModel):
    id: int
    name: str
    created_at: datetime
    progress: float
    card_count: int
    cards: List[ExportCard]

class ExportAnalytics(BaseModel):
    total_cards_studied: int
    total_correct_answers: int
    cards_mastered: int
    overall_average_progress: float
    total_study_sessions: int
    updated_at: Optional[datetime] = None

class ExportMetadata(BaseModel):
    app_name: str = "Flash Wise Buddy"
    export_date: datetime
    version: str = "1.0"
    user_id: str
    total_decks: int
    total_cards: int
    total_study_sessions: int

class FullExportResponse(BaseModel):
    export_metadata: ExportMetadata
    decks: List[ExportDeck]
    analytics: Optional[ExportAnalytics] = None

@router.get("/all", response_model=FullExportResponse)
def export_all_data(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Export all user data including decks, cards, and analytics"""
    try:
        user_id = current_user["uid"]
        
        # Ensure user exists in database
        user_service = UserService(db)
        user_service.get_or_create_user(current_user["firebase_token"])
        
        # Get all user's decks with cards
        decks_query = db.query(models.Deck).filter(
            models.Deck.user_id == user_id
        ).all()
        
        export_decks = []
        total_cards = 0
        
        for deck in decks_query:
            # Get all cards for this deck
            cards = db.query(models.Card).filter(
                models.Card.deck_id == deck.id
            ).all()
            
            # Convert cards to export format (excluding audio_url)
            export_cards = [
                ExportCard(
                    id=card.id,
                    deck_id=card.deck_id,
                    front=card.front,
                    back=card.back,
                    example_sentence_1=card.example_sentence_1,
                    sentence_translation_1=card.sentence_translation_1,
                    example_sentence_2=card.example_sentence_2,
                    sentence_translation_2=card.sentence_translation_2,
                    accuracy=card.accuracy,
                    total_attempts=card.total_attempts,
                    correct_answers=card.correct_answers,
                    last_reviewed_at=card.last_reviewed_at,
                    created_at=card.created_at
                ) for card in cards
            ]
            
            export_deck = ExportDeck(
                id=deck.id,
                name=deck.name,
                created_at=deck.created_at,
                progress=deck.progress,
                card_count=deck.card_count,
                cards=export_cards
            )
            
            export_decks.append(export_deck)
            total_cards += len(cards)
        
        # Get analytics data
        analytics_data = db.query(models.TestAnalytics).filter(
            models.TestAnalytics.user_id == user_id
        ).first()
        
        # Get study sessions count
        study_sessions_count = db.query(models.StudySession).filter(
            models.StudySession.user_id == user_id
        ).count()
        
        export_analytics = None
        if analytics_data:
            export_analytics = ExportAnalytics(
                total_cards_studied=analytics_data.total_cards_studied or 0,
                total_correct_answers=analytics_data.total_correct_answers or 0,
                cards_mastered=analytics_data.cards_mastered or 0,
                overall_average_progress=analytics_data.overall_average_progress or 0.0,
                total_study_sessions=study_sessions_count,
                updated_at=analytics_data.updated_at
            )
        
        # Create export metadata
        export_metadata = ExportMetadata(
            export_date=datetime.utcnow(),
            user_id=user_id,
            total_decks=len(export_decks),
            total_cards=total_cards,
            total_study_sessions=study_sessions_count
        )
        
        return FullExportResponse(
            export_metadata=export_metadata,
            decks=export_decks,
            analytics=export_analytics
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")