from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.database import SessionLocal
from app.schemas import StudySession, CreateSessionRequest, TestResult, TestStats
from app.session_service import SessionService

router = APIRouter(prefix="/study", tags=["study sessions"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/sessions", response_model=StudySession)
def create_study_session(request: CreateSessionRequest, db: Session = Depends(get_db)):
    try:
        session_service = SessionService(db)
        return session_service.create_study_session(
            test_type=request.test_type,
            deck_ids=request.deck_ids,
            limit=request.limit
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sessions/complete")
def complete_study_session(
        results: List[TestResult],
        background_tasks: BackgroundTasks,  
        db: Session = Depends(get_db),
):
    session_service = SessionService(db)
    session_service.complete_session(results)
    background_tasks.add_task(session_service.update_analytics)
    return {"message": "Session completed successfully"}

@router.get("/test/{test_type}/stats", response_model=TestStats)
def get_test_stats(
    test_type: str,
    deck_ids: str = None,
    db: Session = Depends(get_db)
):
    try:
        # Parse deck_ids from comma-separated string if provided
        parsed_deck_ids = None
        if deck_ids:
            parsed_deck_ids = [int(x.strip()) for x in deck_ids.split(",") if x.strip()]
        
        session_service = SessionService(db)
        return session_service.get_test_stats(test_type, parsed_deck_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))