from datetime import datetime
from typing import List
import logging

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models import Deck as DeckORM, Card as CardORM, User as UserORM
from app.schemas import DeckCreate, DeckWithCardsCreate, DeckWithCardsResponse, Card as CardSchema, CardCreate
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
            is_public=deck_data.is_public,
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
                is_public=deck_data.is_public,
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
                    example_sentence_1=getattr(card_data, 'example_sentence_1', None),
                    sentence_translation_1=getattr(card_data, 'sentence_translation_1', None),
                    example_sentence_2=getattr(card_data, 'example_sentence_2', None),
                    sentence_translation_2=getattr(card_data, 'sentence_translation_2', None),
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
                is_public=db_deck.is_public,
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

    def get_deck_by_id(self, deck_id: int, user_id: str) -> DeckORM:
        """Get a specific deck by ID for a user in their selected language"""
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
        
        return deck

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
    
    def get_all_user_cards(self, user_id: str) -> List[CardORM]:
        """Get all cards from all decks belonging to a user in their selected language"""
        # Get user's selected language
        user = self.db.query(UserORM).filter(UserORM.uid == user_id).first()
        user_language = user.selected_language if user and user.selected_language else 'en'
        
        # Query all cards from all user's decks that match their language
        return self.db.query(CardORM).join(DeckORM).filter(
            DeckORM.user_id == user_id,
            DeckORM.language == user_language
        ).all()
    
    def delete_deck(self, deck_id: int, user_id: str) -> bool:
        """Delete a deck and all associated cards for a specific user"""
        try:
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
            
            # Delete all cards associated with the deck first
            self.db.query(CardORM).filter(CardORM.deck_id == deck_id).delete()
            
            # Delete the deck
            self.db.delete(deck)
            self.db.commit()
            
            return True
            
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Failed to delete deck {deck_id}: {str(e)}")
            raise Exception(f"Failed to delete deck: {str(e)}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting deck {deck_id}: {str(e)}")
            raise e
    
    def add_card_to_deck(self, deck_id: int, card_data: CardCreate, user_id: str) -> CardORM:
        """Add a new card to an existing deck for a specific user"""
        try:
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
            
            # Create new card
            db_card = CardORM(
                deck_id=deck_id,
                front=card_data.front.strip(),
                back=card_data.back.strip(),
                example_sentence_1=getattr(card_data, 'example_sentence_1', None),
                sentence_translation_1=getattr(card_data, 'sentence_translation_1', None),
                example_sentence_2=getattr(card_data, 'example_sentence_2', None),
                sentence_translation_2=getattr(card_data, 'sentence_translation_2', None),
                accuracy=0.0,
                total_attempts=0,
                correct_answers=0,
                created_at=datetime.now(),
                audio_path=audio_path
            )
            
            self.db.add(db_card)
            
            # Update deck card count
            deck.card_count = self.db.query(CardORM).filter(CardORM.deck_id == deck_id).count() + 1
            
            self.db.commit()
            self.db.refresh(db_card)
            
            return db_card
            
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Failed to add card to deck {deck_id}: {str(e)}")
            raise Exception(f"Failed to add card to deck: {str(e)}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error adding card to deck {deck_id}: {str(e)}")
            raise e

    def patch_deck_with_cards(self, deck_id: int, deck_data: DeckWithCardsCreate, user_id: str) -> DeckWithCardsResponse:
        """Update a deck and patch existing cards while preserving statistics"""
        try:
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
            
            # Get existing cards
            existing_cards = {card.id: card for card in self.db.query(CardORM).filter(CardORM.deck_id == deck_id).all()}
            
            # Start transaction
            # Update deck name and public status
            deck.name = deck_data.name
            deck.is_public = deck_data.is_public
            
            # Process cards from request
            updated_cards = []
            for card_data in deck_data.cards:
                card_id = getattr(card_data, 'id', None)
                
                if card_id and card_id in existing_cards:
                    # Update existing card, preserve statistics
                    existing_card = existing_cards[card_id]
                    
                    # Update content fields only
                    existing_card.front = card_data.front
                    existing_card.back = card_data.back
                    existing_card.example_sentence_1 = getattr(card_data, 'example_sentence_1', None)
                    existing_card.sentence_translation_1 = getattr(card_data, 'sentence_translation_1', None)
                    existing_card.example_sentence_2 = getattr(card_data, 'example_sentence_2', None)
                    existing_card.sentence_translation_2 = getattr(card_data, 'sentence_translation_2', None)
                    
                    # Generate new audio if front text changed
                    try:
                        if voice_generator.is_language_supported(user_language):
                            audio_path = voice_generator.get_voice(user_language, card_data.front)
                            if audio_path:
                                existing_card.audio_path = audio_path
                                logger.info(f"Updated audio for '{card_data.front}' in {user_language}: {audio_path}")
                            else:
                                logger.warning(f"Failed to generate audio for '{card_data.front}' in {user_language}")
                        else:
                            logger.info(f"Audio generation skipped for '{card_data.front}' - language '{user_language}' not supported for TTS")
                    except Exception as e:
                        logger.error(f"Audio generation failed for '{card_data.front}' in {user_language}: {e}")
                    
                    # Keep existing statistics: accuracy, total_attempts, correct_answers, last_reviewed_at, created_at
                    updated_cards.append(existing_card)
                else:
                    logger.warning(f"Card with ID {card_id} not found in deck {deck_id}. Use POST /decks/{deck_id}/cards to add new cards.")
            
            # Update deck card count to reflect actual number of cards in database
            deck.card_count = self.db.query(CardORM).filter(CardORM.deck_id == deck_id).count()
            
            # Commit transaction
            self.db.commit()
            
            # Refresh to get all data
            self.db.refresh(deck)
            for card in updated_cards:
                self.db.refresh(card)
            
            # Convert to response schema
            card_schemas = [CardSchema.model_validate(card) for card in updated_cards]
            
            return DeckWithCardsResponse(
                id=deck.id,
                name=deck.name,
                is_public=deck.is_public,
                created_at=deck.created_at,
                progress=deck.progress,
                card_count=deck.card_count,
                cards=card_schemas
            )
            
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Failed to patch deck {deck_id}: {str(e)}")
            raise Exception(f"Failed to patch deck with cards: {str(e)}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error patching deck {deck_id}: {str(e)}")
            raise e
    
    def delete_card(self, deck_id: int, card_id: int, user_id: str) -> bool:
        """Delete a specific card from a deck for a specific user"""
        try:
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
            
            # Find the card and verify it belongs to the deck
            card = self.db.query(CardORM).filter(
                CardORM.id == card_id,
                CardORM.deck_id == deck_id
            ).first()
            
            if not card:
                raise Exception("Card not found or access denied")
            
            # Delete the card
            self.db.delete(card)
            
            # Update deck card count
            deck.card_count = self.db.query(CardORM).filter(CardORM.deck_id == deck_id).count() - 1
            
            self.db.commit()
            
            return True
            
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Failed to delete card {card_id} from deck {deck_id}: {str(e)}")
            raise Exception(f"Failed to delete card: {str(e)}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting card {card_id} from deck {deck_id}: {str(e)}")
            raise e

    def update_card(self, deck_id: int, card_id: int, card_data: CardCreate, user_id: str) -> CardORM:
        """Update a specific card while preserving statistics"""
        try:
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
            
            # Find the card and verify it belongs to the deck
            card = self.db.query(CardORM).filter(
                CardORM.id == card_id,
                CardORM.deck_id == deck_id
            ).first()
            
            if not card:
                raise Exception("Card not found or access denied")
            
            # Update content fields only, preserve statistics
            card.front = card_data.front
            card.back = card_data.back
            card.example_sentence_1 = getattr(card_data, 'example_sentence_1', None)
            card.sentence_translation_1 = getattr(card_data, 'sentence_translation_1', None)
            card.example_sentence_2 = getattr(card_data, 'example_sentence_2', None)
            card.sentence_translation_2 = getattr(card_data, 'sentence_translation_2', None)
            
            # Generate new audio if front text changed
            try:
                if voice_generator.is_language_supported(user_language):
                    audio_path = voice_generator.get_voice(user_language, card_data.front)
                    if audio_path:
                        card.audio_path = audio_path
                        logger.info(f"Updated audio for '{card_data.front}' in {user_language}: {audio_path}")
                    else:
                        logger.warning(f"Failed to generate audio for '{card_data.front}' in {user_language}")
                else:
                    logger.info(f"Audio generation skipped for '{card_data.front}' - language '{user_language}' not supported for TTS")
            except Exception as e:
                logger.error(f"Audio generation failed for '{card_data.front}' in {user_language}: {e}")
            
            self.db.commit()
            self.db.refresh(card)
            
            return card
            
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Failed to update card {card_id} in deck {deck_id}: {str(e)}")
            raise Exception(f"Failed to update card: {str(e)}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating card {card_id} in deck {deck_id}: {str(e)}")
            raise e