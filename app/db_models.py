from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Deck(Base):
    __tablename__ = "decks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    progress = Column(Float, default=0.0)
    card_count = Column(Integer, default=0)

    cards = relationship("Card", back_populates="deck")

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("decks.id"))
    front = Column(String, nullable=False)
    back = Column(String, nullable=False)
    accuracy = Column(Float, default=0.0)
    total_attempts = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    last_reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    deck = relationship("Deck", back_populates="cards")

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True)
    deck_id = Column(Integer, ForeignKey("decks.id"), nullable=False)
    passed_words = Column(ARRAY(Integer), nullable=False)  
    missed_words = Column(ARRAY(Integer), nullable=False)
    total_cards = Column(Integer, nullable=False)
    passed_count = Column(Integer, nullable=False)
    missed_count = Column(Integer, nullable=False)
    accuracy_percentage = Column(Float, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    deck = relationship("Deck")
