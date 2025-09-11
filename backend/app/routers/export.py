from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
import json

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

class ExportCard(BaseModel):
    """Card schema for export without audio_url"""
    id: int
    deck_id: int
    front: str
    back: str
    example_sentence_1: Optional[str] = None
    sentence_translation_1: Optional[str] = None
    example_sentence_2: Optional[str] = None
    sentence_translation_2: Optional[str] = None
    accuracy: float = 0.0
    total_attempts: int = 0
    correct_answers: int = 0
    last_reviewed_at: Optional[datetime] = None
    created_at: datetime
    
    model_config = {"from_attributes": True}

class ExportDeck(BaseModel):
    id: int
    name: str
    created_at: datetime
    progress: float
    card_count: int
    cards: List[ExportCard]
    
    model_config = {"from_attributes": True}

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

class ImportResult(BaseModel):
    success: bool
    message: str
    imported_decks: int
    imported_cards: int

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
            export_cards = [ExportCard.model_validate(card) for card in cards]
            
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

@router.post("/import", response_model=ImportResult)
def import_all_data(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Import all user data - DESTRUCTIVE: replaces all existing data"""
    try:
        user_id = current_user["uid"]
        
        # Ensure user exists in database
        user_service = UserService(db)
        user_service.get_or_create_user(current_user["firebase_token"])
        
        # Read and parse the uploaded file
        if not file.filename.endswith('.json'):
            raise HTTPException(status_code=400, detail="File must be a JSON file")
        
        content = file.file.read()
        try:
            import_data = json.loads(content)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON file")
        
        # Validate the import data structure
        if not all(key in import_data for key in ['export_metadata', 'decks']):
            raise HTTPException(status_code=400, detail="Invalid export file format")
        
        # Start transaction for atomic operation
        db.begin()
        
        try:
            # DESTRUCTIVE: Delete all existing user data
            # Delete study sessions first (foreign key constraint)
            db.query(models.StudySession).filter(
                models.StudySession.user_id == user_id
            ).delete()
            
            # Delete analytics
            db.query(models.TestAnalytics).filter(
                models.TestAnalytics.user_id == user_id
            ).delete()
            
            # Delete cards (will cascade from decks, but explicit for clarity)
            deck_ids = db.query(models.Deck.id).filter(
                models.Deck.user_id == user_id
            ).subquery()
            
            db.query(models.Card).filter(
                models.Card.deck_id.in_(deck_ids)
            ).delete(synchronize_session=False)
            
            # Delete decks
            db.query(models.Deck).filter(
                models.Deck.user_id == user_id
            ).delete()
            
            # Import new data
            imported_decks = 0
            imported_cards = 0
            
            for deck_data in import_data['decks']:
                # Create new deck
                new_deck = models.Deck(
                    user_id=user_id,
                    name=deck_data['name'],
                    created_at=datetime.fromisoformat(deck_data['created_at'].replace('Z', '+00:00')),
                    progress=deck_data['progress'],
                    card_count=deck_data['card_count']
                )
                db.add(new_deck)
                db.flush()  # Get the new deck ID
                
                imported_decks += 1
                
                # Import cards for this deck
                for card_data in deck_data['cards']:
                    new_card = models.Card(
                        deck_id=new_deck.id,
                        front=card_data['front'],
                        back=card_data['back'],
                        example_sentence_1=card_data.get('example_sentence_1'),
                        sentence_translation_1=card_data.get('sentence_translation_1'),
                        example_sentence_2=card_data.get('example_sentence_2'),
                        sentence_translation_2=card_data.get('sentence_translation_2'),
                        accuracy=card_data['accuracy'],
                        total_attempts=card_data['total_attempts'],
                        correct_answers=card_data['correct_answers'],
                        last_reviewed_at=datetime.fromisoformat(card_data['last_reviewed_at'].replace('Z', '+00:00')) if card_data.get('last_reviewed_at') else None,
                        created_at=datetime.fromisoformat(card_data['created_at'].replace('Z', '+00:00'))
                    )
                    db.add(new_card)
                    imported_cards += 1
            
            # Import analytics if present
            if import_data.get('analytics'):
                analytics_data = import_data['analytics']
                new_analytics = models.TestAnalytics(
                    user_id=user_id,
                    total_cards_studied=analytics_data['total_cards_studied'],
                    total_correct_answers=analytics_data['total_correct_answers'],
                    cards_mastered=analytics_data['cards_mastered'],
                    overall_average_progress=analytics_data['overall_average_progress']
                )
                db.add(new_analytics)
            
            # Commit the transaction
            db.commit()
            
            return ImportResult(
                success=True,
                message=f"Successfully imported {imported_decks} decks with {imported_cards} cards",
                imported_decks=imported_decks,
                imported_cards=imported_cards
            )
            
        except Exception as e:
            db.rollback()
            raise e
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")