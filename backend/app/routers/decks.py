from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import SessionLocal
from app import models, schemas
from app.schemas import Card, DeckCreate, DeckWithCardsCreate, DeckWithCardsResponse
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

@router.get("/", response_model=list[schemas.DeckOut]) 
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

@router.post("/", response_model=schemas.DeckOut)
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

@router.get("/{deck_id}/cards", response_model=List[Card])
def get_deck_cards(
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
        cards = deck_service.get_user_deck_cards(deck_id, user_id)
        
        if not cards:
            raise HTTPException(status_code=404, detail="Deck not found or has no cards")
        
        return cards
    except Exception as e:
        if "not found or access denied" in str(e):
            raise HTTPException(status_code=404, detail="Deck not found or access denied")
        raise HTTPException(status_code=400, detail=str(e))