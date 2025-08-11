from datetime import datetime
from typing import List
import logging

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models import Deck as DeckORM, Card as CardORM, User as UserORM
from app.schemas import DeckCreate, DeckWithCardsCreate, DeckWithCardsResponse, Card as CardSchema
from app.voice_service import voice_generator

logger = logging.getLogger(__name__)


class DeckService:
    def __init__(self, db: Session):
        self.db = db

    def create_deck(self, deck_data: DeckCreate, user_id: str) -> DeckORM:
        """Create a single deck without cards"""
        # Get user's selected language
        user = self.db.query(UserORM).filter(UserORM.uid == user_id).first()
        user_language = user.selected_language if user and user.selected_language else 'en'
        
        db_deck = DeckORM(
            name=deck_data.name,
            user_id=user_id,
            language=user_language,
            created_at=datetime.now(),
            progress=0.0,
            card_count=0
        )
        self.db.add(db_deck)
        self.db.commit()
        self.db.refresh(db_deck)
        return db_deck

    def create_deck_with_cards(self, deck_data: DeckWithCardsCreate, user_id: str) -> DeckWithCardsResponse:
        """Create a deck with cards atomically"""
        try:
            # Get user's selected language
            user = self.db.query(UserORM).filter(UserORM.uid == user_id).first()
            user_language = user.selected_language if user and user.selected_language else 'en'
            
            # Start transaction
            # self.db.begin()
            
            # Create deck
            db_deck = DeckORM(
                name=deck_data.name,
                user_id=user_id,
                language=user_language,
                created_at=datetime.now(),
                progress=0.0,
                card_count=len(deck_data.cards)
            )
            self.db.add(db_deck)
            self.db.flush()  # Get deck ID without committing
            
            # Create cards
            db_cards = []
            for card_data in deck_data.cards:
                # Generate audio with fault tolerance
                audio_path = None
                try:
                    if voice_generator.is_language_supported(user_language):
                        audio_path = voice_generator.get_voice(user_language, card_data.front)
                        if audio_path:
                            logger.info(f"Generated audio for '{card_data.front}' in {user_language}: {audio_path}")
                        else:
                            logger.warning(f"Failed to generate audio for '{card_data.front}' in {user_language}")
                    else:
                        logger.info(f"Audio generation skipped for '{card_data.front}' - language '{user_language}' not supported for TTS")
                except Exception as e:
                    logger.error(f"Audio generation failed for '{card_data.front}' in {user_language}: {e}")
                
                db_card = CardORM(
                    deck_id=db_deck.id,
                    front=card_data.front,
                    back=card_data.back,
                    accuracy=0.0,
                    total_attempts=0,
                    correct_answers=0,
                    created_at=datetime.now(),
                    audio_path=audio_path
                )
                self.db.add(db_card)
                db_cards.append(db_card)
            
            # Commit transaction
            self.db.commit()
            
            # Refresh to get all data
            self.db.refresh(db_deck)
            for card in db_cards:
                self.db.refresh(card)
            
            # Convert to response schema
            card_schemas = [CardSchema.model_validate(card) for card in db_cards]
            
            return DeckWithCardsResponse(
                id=db_deck.id,
                name=db_deck.name,
                created_at=db_deck.created_at,
                progress=db_deck.progress,
                card_count=db_deck.card_count,
                cards=card_schemas
            )
            
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Failed to create deck with cards: {str(e)}")

    def get_user_decks(self, user_id: str) -> List[DeckORM]:
        """Get all decks for a specific user filtered by their selected language"""
        # Get user's selected language
        user = self.db.query(UserORM).filter(UserORM.uid == user_id).first()
        user_language = user.selected_language if user and user.selected_language else 'en'
        
        return self.db.query(DeckORM).filter(
            DeckORM.user_id == user_id,
            DeckORM.language == user_language
        ).all()

    def get_user_deck_cards(self, deck_id: int, user_id: str) -> List[CardORM]:
        """Get all cards for a specific deck belonging to a user in their selected language"""
        # Get user's selected language
        user = self.db.query(UserORM).filter(UserORM.uid == user_id).first()
        user_language = user.selected_language if user and user.selected_language else 'en'
        
        # Verify deck belongs to user and matches their language
        deck = self.db.query(DeckORM).filter(
            DeckORM.id == deck_id, 
            DeckORM.user_id == user_id,
            DeckORM.language == user_language
        ).first()
        
        if not deck:
            raise Exception("Deck not found or access denied")
        
        return self.db.query(CardORM).filter(CardORM.deck_id == deck_id).all()