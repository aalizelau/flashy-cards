from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from fastapi import Depends
from sqlalchemy.orm import Session
from .database import SessionLocal
from . import database, models, schemas
from app.schemas import Card, StudySession, CreateSessionRequest, TestResult, TestAnalytics
from app.models import Card as CardORM, TestAnalytics as TestAnalyticsORM
from sqlalchemy.orm import Session
from app.session_service import SessionService


app = FastAPI(title="Flashcard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://192.168.1.141:8080"  
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Flashcard API"}

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/decks", response_model=list[schemas.DeckOut]) 
def read_decks(db: Session = Depends(get_db)):
    return db.query(models.Deck).all()

@app.get("/decks/{deck_id}/cards", response_model=List[Card])
def get_deck_cards(deck_id: int, db: Session = Depends(get_db)):
    cards = db.query(CardORM).filter(CardORM.deck_id == deck_id).all()
    if not cards:
        raise HTTPException(status_code=404, detail="Deck not found or has no cards")
    return cards

@app.post("/study/sessions", response_model=StudySession)
def create_study_session(request: CreateSessionRequest, db: Session = Depends(get_db)):
    try:
        session_service = SessionService(db)
        return session_service.create_study_session(request.deck_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/study/sessions/complete")
def complete_study_session(
        results: List[TestResult],
        background_tasks: BackgroundTasks,  
        db: Session = Depends(get_db),
):
    session_service = SessionService(db)
    session_service.complete_session(results)
    background_tasks.add_task(session_service.update_analytics)
    return {"message": "Session completed successfully"}


@app.get("/analytics", response_model=TestAnalytics)
def get_analytics(db: Session = Depends(get_db)):
    analytics = db.query(TestAnalyticsORM).order_by(TestAnalyticsORM.updated_at.desc()).first()
    if not analytics:
        raise HTTPException(status_code=404, detail="No analytics data found")
    return analytics
    


