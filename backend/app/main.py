from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import decks, sessions, analytics

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

# Include routers
app.include_router(decks.router)
app.include_router(sessions.router) 
app.include_router(analytics.router)

