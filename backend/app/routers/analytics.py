from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.schemas import TestAnalytics
from app.models import TestAnalytics as TestAnalyticsORM

router = APIRouter(prefix="/analytics", tags=["analytics"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=TestAnalytics)
def get_analytics(db: Session = Depends(get_db)):
    analytics = db.query(TestAnalyticsORM).order_by(TestAnalyticsORM.updated_at.desc()).first()
    if not analytics:
        raise HTTPException(status_code=404, detail="No analytics data found")
    return analytics