from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.schemas import User, UserUpdate
from app.user_service import UserService
from app.auth_middleware import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/me", response_model=User)
def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get current user's profile"""
    user_service = UserService(db)
    user = user_service.get_or_create_user(current_user["firebase_token"])
    return user

@router.put("/me", response_model=User)
def update_current_user_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update current user's profile"""
    user_id = current_user["uid"]
    
    try:
        user_service = UserService(db)
        updated_user = user_service.update_user(user_id, user_data)
        
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return updated_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/me")
def delete_current_user_account(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete current user's account and all associated data"""
    user_id = current_user["uid"]
    
    try:
        user_service = UserService(db)
        success = user_service.delete_user(user_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "User account deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))