from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_tables

from app.routers import decks, sessions, analytics, users
import app.firebase_config  # Initialize Firebase
from app.auth_middleware import get_current_user

app = FastAPI(title="Flashcard API", version="1.0.0")


@app.on_event("startup")
def on_startup():
    create_tables()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite frontend dev server
        "http://localhost:8080",
        "http://localhost",
        "http://192.168.1.141:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Flashcard API"}


# Include routers
app.include_router(decks.router)
app.include_router(sessions.router)
app.include_router(analytics.router)
app.include_router(users.router)

