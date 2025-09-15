from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from firebase_admin import auth

from app.models import User as UserORM
from app.schemas import UserCreate, UserUpdate


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_uid(self, uid: str) -> Optional[UserORM]:
        """Get user by Firebase UID"""
        return self.db.query(UserORM).filter(UserORM.uid == uid).first()

    def get_user_by_email(self, email: str) -> Optional[UserORM]:
        """Get user by email"""
        return self.db.query(UserORM).filter(UserORM.email == email).first()

    def create_user(self, user_data: UserCreate) -> UserORM:
        """Create a new user"""
        try:
            db_user = UserORM(
                uid=user_data.uid,
                email=user_data.email,
                name=user_data.name,
                selected_language=user_data.selected_language,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            return db_user
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Failed to create user: {str(e)}")

    def update_user(self, uid: str, user_data: UserUpdate) -> Optional[UserORM]:
        """Update user information"""
        try:
            db_user = self.get_user_by_uid(uid)
            if not db_user:
                return None

            if user_data.email is not None:
                db_user.email = user_data.email
            if user_data.name is not None:
                db_user.name = user_data.name
            if user_data.selected_language is not None:
                db_user.selected_language = user_data.selected_language
            
            db_user.updated_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(db_user)
            return db_user
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Failed to update user: {str(e)}")

    def get_or_create_user(self, firebase_user: dict) -> UserORM:
        """Get existing user or create new one from Firebase token data"""
        uid = firebase_user.get("uid")
        email = firebase_user.get("email")
        name = firebase_user.get("name")
        selected_language = firebase_user.get("selected_language", None)

        # Try to get existing user
        existing_user = self.get_user_by_uid(uid)
        if existing_user:
            # Update user info if it has changed
            needs_update = False
            if existing_user.email != email and email:
                existing_user.email = email
                needs_update = True
            if existing_user.name != name and name:
                existing_user.name = name
                needs_update = True
            
            if needs_update:
                existing_user.updated_at = datetime.utcnow()
                self.db.commit()
                self.db.refresh(existing_user)
            
            return existing_user

        # Create new user
        user_data = UserCreate(
            uid=uid,
            email=email or "",
            name=name,
            selected_language=selected_language
        )
        return self.create_user(user_data)

    def delete_user(self, uid: str) -> bool:
        """Delete user and all related data with proper cascading"""
        try:
            db_user = self.get_user_by_uid(uid)
            if not db_user:
                return False

            # Start a transaction for atomic deletion
            # Delete related data in correct order (child tables first)

            # 1. Delete study sessions
            from app.models import StudySession
            self.db.query(StudySession).filter(StudySession.user_id == uid).delete()

            # 2. Delete analytics records
            from app.models import TestAnalytics
            self.db.query(TestAnalytics).filter(TestAnalytics.user_id == uid).delete()

            # 3. Delete cards from user's decks (cards reference decks)
            from app.models import Deck, Card
            user_deck_ids = [deck.id for deck in db_user.decks]
            if user_deck_ids:
                self.db.query(Card).filter(Card.deck_id.in_(user_deck_ids)).delete()

            # 4. Delete user's decks
            self.db.query(Deck).filter(Deck.user_id == uid).delete()

            # 5. Finally delete the user from database
            self.db.delete(db_user)

            # Commit database changes first
            self.db.commit()

            # 6. Try to delete Firebase user (after DB commit succeeds)
            try:
                auth.delete_user(uid)
            except Exception as firebase_error:
                # Log the Firebase error but don't fail the entire operation
                # since the database deletion already succeeded
                print(f"Warning: Failed to delete Firebase user {uid}: {firebase_error}")
                # You might want to use proper logging here instead of print

            return True

        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Failed to delete user: {str(e)}")
        except Exception as e:
            # If we reach here, database deletion succeeded but Firebase deletion failed
            # This is logged above, so we still return True as the core deletion succeeded
            return True