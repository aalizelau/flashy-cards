from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
# Database schema is now managed by Alembic migrations

from app.routers import decks, sessions, analytics, users, export
import app.firebase_config  # Initialize Firebase
from app.auth_middleware import get_current_user

VOICES_DIR = "voices"

app = FastAPI(title="Flashcard API", version="1.0.0")


@app.on_event("startup")
def on_startup():
    # Database tables are created via Alembic migrations
    # Run 'alembic upgrade head' before starting the app
    
    # Create voices directory if it doesn't exist
    voices_dir = Path(VOICES_DIR)
    voices_dir.mkdir(exist_ok=True)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite frontend dev server
        "http://localhost:8080",
        "http://localhost",
        "http://192.168.1.141:8080",
        "http://64.23.144.100",
        "http://64.23.144.100:5000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Flashcard API"}


# Mount static files for audio
# Check if voices directory exists, create if not
voices_path = Path(VOICES_DIR)
if not voices_path.exists():
    voices_path.mkdir(parents=True, exist_ok=True)

app.mount("/audio", StaticFiles(directory=VOICES_DIR), name="audio")

# Include routers
app.include_router(decks.router)
app.include_router(sessions.router)
app.include_router(analytics.router)
app.include_router(users.router)
app.include_router(export.router)

