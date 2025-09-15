from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, ARRAY, func
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    uid = Column(String, primary_key=True, index=True)  # Firebase UID
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    selected_language = Column(String, nullable=True, default=None)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    decks = relationship("Deck", back_populates="user")
    study_sessions = relationship("StudySession", back_populates="user")
    analytics = relationship("TestAnalytics", back_populates="user")


class Deck(Base):
    __tablename__ = "decks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.uid"), nullable=False, index=True)
    language = Column(String, nullable=False, default='en', index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    progress = Column(Float, default=0.0)
    card_count = Column(Integer, default=0)

    user = relationship("User", back_populates="decks")
    cards = relationship("Card", back_populates="deck")

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("decks.id"))
    front = Column(String, nullable=False)
    back = Column(String, nullable=False)
    example_sentence_1 = Column(String, nullable=True)
    sentence_translation_1 = Column(String, nullable=True)
    example_sentence_2 = Column(String, nullable=True)
    sentence_translation_2 = Column(String, nullable=True)
    accuracy = Column(Float, default=0.0)
    total_attempts = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    last_reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    audio_path = Column(String, nullable=True)  # Path to TTS audio file

    deck = relationship("Deck", back_populates="cards")

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey("users.uid"), nullable=False, index=True)
    deck_id = Column(Integer, ForeignKey("decks.id"), nullable=False)
    passed_words = Column(ARRAY(Integer), nullable=False)  
    missed_words = Column(ARRAY(Integer), nullable=False)
    total_cards = Column(Integer, nullable=False)
    passed_count = Column(Integer, nullable=False)
    missed_count = Column(Integer, nullable=False)
    accuracy_percentage = Column(Float, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="study_sessions")
    deck = relationship("Deck")

class TestAnalytics(Base):
    __tablename__ = "test_analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.uid"), nullable=False, index=True)
    total_cards_studied = Column(Integer)
    total_correct_answers = Column(Integer)
    cards_mastered = Column(Integer)
    overall_average_progress = Column(Float)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="analytics")
