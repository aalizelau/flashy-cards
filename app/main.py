from fastapi import FastAPI, HTTPException
from typing import List
from .models import Deck, Card, StudySession, SessionComplete, Analytics
from .data import data_layer

app = FastAPI(title="Flashcard API", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Flashcard API"}

@app.get("/decks", response_model=List[Deck])
def get_decks():
    return data_layer.get_all_decks()

@app.get("/decks/{deck_id}/cards", response_model=List[Card])
def get_deck_cards(deck_id: int):
    cards = data_layer.get_cards_by_deck_id(deck_id)
    if not cards:
        raise HTTPException(status_code=404, detail="Deck not found or has no cards")
    return cards

@app.post("/study/sessions", response_model=StudySession)
def create_study_session(deck_id: int):
    deck_cards = data_layer.get_cards_by_deck_id(deck_id)
    if not deck_cards:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    session = data_layer.create_session(deck_id)
    return session

@app.post("/study/sessions/complete")
def complete_study_session(session_data: SessionComplete):
    success = data_layer.complete_session(session_data)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to complete session")
    
    return {"message": "Session completed successfully"}

@app.get("/analytics", response_model=Analytics)
def get_analytics():
    return data_layer.get_analytics()