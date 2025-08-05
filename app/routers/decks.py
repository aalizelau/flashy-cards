from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import SessionLocal
from app import models, schemas
from app.schemas import Card, DeckCreate, DeckWithCardsCreate, DeckWithCardsResponse
from app.models import Card as CardORM
from app.deck_service import DeckService

router = APIRouter(prefix="/decks", tags=["decks"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.DeckOut]) 
def read_decks(db: Session = Depends(get_db)):
    return db.query(models.Deck).all()

@router.post("/", response_model=schemas.DeckOut)
def create_deck(deck_data: DeckCreate, db: Session = Depends(get_db)):
    try:
        deck_service = DeckService(db)
        return deck_service.create_deck(deck_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/with-cards", response_model=DeckWithCardsResponse)
def create_deck_with_cards(deck_data: DeckWithCardsCreate, db: Session = Depends(get_db)):
    try:
        deck_service = DeckService(db)
        return deck_service.create_deck_with_cards(deck_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{deck_id}/cards", response_model=List[Card])
def get_deck_cards(deck_id: int, db: Session = Depends(get_db)):
    cards = db.query(CardORM).filter(CardORM.deck_id == deck_id).all()
    if not cards:
        raise HTTPException(status_code=404, detail="Deck not found or has no cards")
    return cards