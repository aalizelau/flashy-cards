from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.schemas import TestAnalytics
from app.models import TestAnalytics as TestAnalyticsORM
from app.auth_middleware import get_current_user
from app.user_service import UserService

router = APIRouter(prefix="/analytics", tags=["analytics"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=TestAnalytics)
def get_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_id = current_user["uid"]
    
    # Ensure user exists in database
    user_service = UserService(db)
    user_service.get_or_create_user(current_user["firebase_token"])
    
    # Get user's analytics
    analytics = db.query(TestAnalyticsORM).filter(
        TestAnalyticsORM.user_id == user_id
    ).order_by(TestAnalyticsORM.updated_at.desc()).first()
    
    if not analytics:
        raise HTTPException(status_code=404, detail="No analytics data found for user")
    return analytics