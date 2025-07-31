from fastapi import FastAPI, HTTPException
from typing import List
from .models import Deck, Card, StudySession, SessionComplete, Analytics, TestResults
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

@app.post("/study/sessions/complete", response_model=SessionComplete)
def complete_study_session(test_results: TestResults):
    session_data = data_layer.complete_session_from_results(test_results)
    
    if not session_data:
        raise HTTPException(status_code=400, detail="Failed to complete session")
    
    return session_data

@app.get("/analytics", response_model=Analytics)
def get_analytics():
    return data_layer.get_analytics()