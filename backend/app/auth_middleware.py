from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()


def verify_firebase_token(token: str) -> Dict:
    """
    Verify Firebase ID token and return decoded token
    """
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except auth.InvalidIdTokenError as e:
        logger.error(f"Invalid Firebase token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError as e:
        logger.error(f"Expired Firebase token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Firebase token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e), 
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """
    FastAPI dependency to get current authenticated user from Firebase token
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify the token and return user information
    decoded_token = verify_firebase_token(credentials.credentials)
    
    return {
        "uid": decoded_token.get("uid"),
        "email": decoded_token.get("email"),
        "name": decoded_token.get("name"),
        "firebase_token": decoded_token
    }


def get_user_id(current_user: Dict = Depends(get_current_user)) -> str:
    """
    FastAPI dependency to get just the user ID
    """
    return current_user["uid"]