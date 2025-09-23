from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Request
from sqlalchemy.orm import Session
from typing import List

from app.database import SessionLocal
from app.schemas import StudySession, CreateSessionRequest, TestResult, TestStats
from app.session_service import SessionService
from app.auth_middleware import get_current_user, get_user_id
from app.user_service import UserService

router = APIRouter(prefix="/study", tags=["study sessions"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/sessions", response_model=StudySession)
def create_study_session(
    request: CreateSessionRequest,
    http_request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        user_id = current_user["uid"]
        
        # Ensure user exists in database
        user_service = UserService(db)
        user_service.get_or_create_user(current_user["firebase_token"])
        
        session_service = SessionService(db)
        return session_service.create_study_session(
            test_type=request.test_type,
            user_id=user_id,
            request=http_request,
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
        current_user = Depends(get_current_user)
):
    user_id = current_user["uid"]
    
    # Ensure user exists in database
    user_service = UserService(db)
    user_service.get_or_create_user(current_user["firebase_token"])
    
    session_service = SessionService(db)
    session_service.complete_session(results)
    background_tasks.add_task(session_service.update_analytics, user_id)
    return {"message": "Session completed successfully"}

@router.get("/test/{test_type}/stats", response_model=TestStats)
def get_test_stats(
    test_type: str,
    deck_ids: str = None,
    threshold: float = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        user_id = current_user["uid"]

        # Ensure user exists in database
        user_service = UserService(db)
        user_service.get_or_create_user(current_user["firebase_token"])

        # Parse deck_ids from comma-separated string if provided
        parsed_deck_ids = None
        if deck_ids:
            parsed_deck_ids = [int(x.strip()) for x in deck_ids.split(",") if x.strip()]

        # Convert percentage threshold to decimal if provided
        decimal_threshold = None
        if threshold is not None:
            decimal_threshold = threshold / 100.0 if threshold > 1 else threshold

        session_service = SessionService(db)
        return session_service.get_test_stats(test_type, user_id, parsed_deck_ids, decimal_threshold)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))