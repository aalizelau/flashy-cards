from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import List

from app.database import SessionLocal
from app import models, schemas
from app.schemas import Card, DeckCreate, DeckWithCardsCreate, DeckWithCardsResponse, CardCreate, PublicDeckOut, CopyPublicDeckRequest
from app.models import Card as CardORM
from app.deck_service import DeckService
from app.auth_middleware import get_current_user, get_user_id
from app.user_service import UserService

router = APIRouter(prefix="/decks", tags=["decks"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def populate_audio_urls(cards: List[CardORM], request: Request) -> List[Card]:
    """Convert CardORM to Card schema with audio URLs"""
    result = []
    base_url = str(request.base_url).rstrip('/')
    
    for card in cards:
        # Convert to Card schema using from_attributes
        card_schema = Card.model_validate(card)
        # Add the audio_url field
        card_schema.audio_url = f"{base_url}/audio/{card.audio_path.replace('voices/', '')}" if card.audio_path else None
        result.append(card_schema)
    
    return result

@router.get("/public", response_model=List[PublicDeckOut])
def get_public_decks(
    language: str = None,
    search: str = None,
    db: Session = Depends(get_db)
):
    """Get all public decks (no authentication required)"""
    try:
        deck_service = DeckService(db)
        return deck_service.get_public_decks(language=language, search=search)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/public/{deck_id}/cards", response_model=List[Card])
def get_public_deck_cards(
    deck_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get cards from a public deck (no authentication required)"""
    try:
        deck_service = DeckService(db)
        cards = deck_service.get_public_deck_cards(deck_id)

        if not cards:
            raise HTTPException(status_code=404, detail="Public deck not found or has no cards")

        return populate_audio_urls(cards, request)
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Public deck not found")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/copy-from-public", response_model=DeckWithCardsResponse)
def copy_public_deck(
    request_data: CopyPublicDeckRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Copy a public deck to user's collection"""
    try:
        user_id = current_user["uid"]

        # Ensure user exists in database
        user_service = UserService(db)
        user_service.get_or_create_user(current_user["firebase_token"])

        deck_service = DeckService(db)
        return deck_service.copy_public_deck(request_data.public_deck_id, user_id)
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Public deck not found")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=list[schemas.DeckOut])
def read_decks(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_id = current_user["uid"]
    
    # Ensure user exists in database
    user_service = UserService(db)
    user_service.get_or_create_user(current_user["firebase_token"])
    
    # Get user's decks
    deck_service = DeckService(db)
    return deck_service.get_user_decks(user_id)

@router.get("/{deck_id}", response_model=schemas.DeckOut)
def get_deck_by_id(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        user_id = current_user["uid"]
        
        # Ensure user exists in database
        user_service = UserService(db)
        user_service.get_or_create_user(current_user["firebase_token"])
        
        deck_service = DeckService(db)
        return deck_service.get_deck_by_id(deck_id, user_id)
    except Exception as e:
        if "not found or access denied" in str(e):
            raise HTTPException(status_code=404, detail="Deck not found or access denied")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("", response_model=schemas.DeckOut)
def create_deck(
    deck_data: DeckCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        user_id = current_user["uid"]
        
        # Ensure user exists in database
        user_service = UserService(db)
        user_service.get_or_create_user(current_user["firebase_token"])
        
        deck_service = DeckService(db)
        return deck_service.create_deck(deck_data, user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/with-cards", response_model=DeckWithCardsResponse)
def create_deck_with_cards(
    deck_data: DeckWithCardsCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        user_id = current_user["uid"]
        
        # Ensure user exists in database
        user_service = UserService(db)
        user_service.get_or_create_user(current_user["firebase_token"])
        
        deck_service = DeckService(db)
        return deck_service.create_deck_with_cards(deck_data, user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{deck_id}/with-cards", response_model=DeckWithCardsResponse)
def patch_deck_with_cards(
    deck_id: int,
    deck_data: DeckWithCardsCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        user_id = current_user["uid"]
        
        # Ensure user exists in database
        user_service = UserService(db)
        user_service.get_or_create_user(current_user["firebase_token"])
        
        deck_service = DeckService(db)
        return deck_service.patch_deck_with_cards(deck_id, deck_data, user_id)
    except Exception as e:
        if "not found or access denied" in str(e):
            raise HTTPException(status_code=404, detail="Deck not found or access denied")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/all/cards", response_model=List[Card])
def get_all_user_cards(
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all cards from all user's decks in their selected language"""
    try:
        user_id = current_user["uid"]
        
        # Ensure user exists in database
        user_service = UserService(db)
        user_service.get_or_create_user(current_user["firebase_token"])
        
        deck_service = DeckService(db)
        cards = deck_service.get_all_user_cards(user_id)
        
        return populate_audio_urls(cards, request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{deck_id}/cards", response_model=List[Card])
def get_deck_cards(
    deck_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        user_id = current_user["uid"]
        
        # Ensure user exists in database
        user_service = UserService(db)
        user_service.get_or_create_user(current_user["firebase_token"])
        
        deck_service = DeckService(db)
        cards = deck_service.get_user_deck_cards(deck_id, user_id)
        
        if not cards:
            raise HTTPException(status_code=404, detail="Deck not found or has no cards")
        
        return populate_audio_urls(cards, request)
    except Exception as e:
        if "not found or access denied" in str(e):
            raise HTTPException(status_code=404, detail="Deck not found or access denied")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{deck_id}/cards", response_model=Card)
def add_card_to_deck(
    deck_id: int,
    card_data: CardCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        user_id = current_user["uid"]
        
        # Ensure user exists in database
        user_service = UserService(db)
        user_service.get_or_create_user(current_user["firebase_token"])
        
        deck_service = DeckService(db)
        db_card = deck_service.add_card_to_deck(deck_id, card_data, user_id)
        
        # Convert to Card schema with audio URL
        card_schema = Card.model_validate(db_card)
        base_url = str(request.base_url).rstrip('/')
        card_schema.audio_url = f"{base_url}/audio/{db_card.audio_path.replace('voices/', '')}" if db_card.audio_path else None
        
        return card_schema
    except Exception as e:
        if "not found or access denied" in str(e):
            raise HTTPException(status_code=404, detail="Deck not found or access denied")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{deck_id}/cards/{card_id}", response_model=Card)
def update_card(
    deck_id: int,
    card_id: int,
    card_data: CardCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        user_id = current_user["uid"]
        
        # Ensure user exists in database
        user_service = UserService(db)
        user_service.get_or_create_user(current_user["firebase_token"])
        
        deck_service = DeckService(db)
        db_card = deck_service.update_card(deck_id, card_id, card_data, user_id)
        
        # Convert to Card schema with audio URL
        card_schema = Card.model_validate(db_card)
        base_url = str(request.base_url).rstrip('/')
        card_schema.audio_url = f"{base_url}/audio/{db_card.audio_path.replace('voices/', '')}" if db_card.audio_path else None
        
        return card_schema
    except Exception as e:
        if "not found or access denied" in str(e):
            raise HTTPException(status_code=404, detail="Card not found or access denied")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{deck_id}/cards/{card_id}")
def delete_card(
    deck_id: int,
    card_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        user_id = current_user["uid"]
        
        # Ensure user exists in database
        user_service = UserService(db)
        user_service.get_or_create_user(current_user["firebase_token"])
        
        deck_service = DeckService(db)
        success = deck_service.delete_card(deck_id, card_id, user_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Card not found")
        
        return {"message": "Card deleted successfully"}
    except Exception as e:
        if "not found or access denied" in str(e):
            raise HTTPException(status_code=404, detail="Card not found or access denied")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{deck_id}")
def delete_deck(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        user_id = current_user["uid"]
        
        # Ensure user exists in database
        user_service = UserService(db)
        user_service.get_or_create_user(current_user["firebase_token"])
        
        deck_service = DeckService(db)
        success = deck_service.delete_deck(deck_id, user_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Deck not found")
        
        return {"message": "Deck deleted successfully"}
    except Exception as e:
        if "not found or access denied" in str(e):
            raise HTTPException(status_code=404, detail="Deck not found or access denied")
        raise HTTPException(status_code=400, detail=str(e))