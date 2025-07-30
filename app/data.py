from datetime import datetime, timedelta
from typing import List, Optional, Dict
from .models import Deck, Card, StudySession, SessionComplete, SessionSummary, Analytics

dummy_decks = [
    Deck(
        id=1,
        name="Spanish Vocabulary",
        description="Basic Spanish words and phrases",
        created_at=datetime.now() - timedelta(days=30),
        card_count=5
    ),
    Deck(
        id=2,
        name="Python Programming",
        description="Python concepts and syntax",
        created_at=datetime.now() - timedelta(days=20),
        card_count=3
    ),
    Deck(
        id=3,
        name="History Facts",
        description="Important historical events",
        created_at=datetime.now() - timedelta(days=10),
        card_count=2
    )
]

dummy_cards = [
    # Spanish deck cards
    Card(id=1, deck_id=1, front="Hello", back="Hola", accuracy=0.8, total_attempts=10, last_reviewed_at=datetime.now() - timedelta(days=1), created_at=datetime.now() - timedelta(days=30)),
    Card(id=2, deck_id=1, front="Goodbye", back="Adiós", accuracy=0.9, total_attempts=5, last_reviewed_at=datetime.now() - timedelta(days=2), created_at=datetime.now() - timedelta(days=30)),
    Card(id=3, deck_id=1, front="Thank you", back="Gracias", accuracy=0.7, total_attempts=8, last_reviewed_at=datetime.now() - timedelta(days=1), created_at=datetime.now() - timedelta(days=29)),
    Card(id=4, deck_id=1, front="Good morning", back="Buenos días", accuracy=0.6, total_attempts=12, created_at=datetime.now() - timedelta(days=29)),
    Card(id=5, deck_id=1, front="How are you?", back="¿Cómo estás?", accuracy=0.5, total_attempts=15, created_at=datetime.now() - timedelta(days=28)),
    
    # Python deck cards
    Card(id=6, deck_id=2, front="What is a list comprehension?", back="A concise way to create lists: [x for x in iterable]", accuracy=0.75, total_attempts=8, last_reviewed_at=datetime.now() - timedelta(days=3), created_at=datetime.now() - timedelta(days=20)),
    Card(id=7, deck_id=2, front="What does 'self' refer to?", back="The instance of the class", accuracy=0.95, total_attempts=6, last_reviewed_at=datetime.now() - timedelta(days=1), created_at=datetime.now() - timedelta(days=20)),
    Card(id=8, deck_id=2, front="What is a decorator?", back="A function that modifies another function", accuracy=0.4, total_attempts=20, created_at=datetime.now() - timedelta(days=19)),
    
    # History deck cards
    Card(id=9, deck_id=3, front="When did World War II end?", back="1945", accuracy=1.0, total_attempts=3, last_reviewed_at=datetime.now() - timedelta(days=5), created_at=datetime.now() - timedelta(days=10)),
    Card(id=10, deck_id=3, front="Who was the first president of the US?", back="George Washington", accuracy=0.85, total_attempts=7, last_reviewed_at=datetime.now() - timedelta(days=2), created_at=datetime.now() - timedelta(days=9)),
]

# Track completed sessions for analytics
completed_sessions_history = [
    {
        "deck_id": 1,
        "passed_words": [1, 2, 3],
        "missed_words": [4, 5],
        "completed_at": datetime.now() - timedelta(days=1)
    },
    {
        "deck_id": 2,
        "passed_words": [6, 7],
        "missed_words": [8],
        "completed_at": datetime.now() - timedelta(days=2)
    }
]

class DataLayer:
    def __init__(self):
        self.decks = dummy_decks.copy()
        self.cards = dummy_cards.copy()
        self.completed_sessions = completed_sessions_history.copy()
    
    def get_all_decks(self) -> List[Deck]:
        return self.decks
    
    def get_cards_by_deck_id(self, deck_id: int) -> List[Card]:
        return [card for card in self.cards if card.deck_id == deck_id]
    
    def create_session(self, deck_id: int) -> StudySession:
        return StudySession(
            deck_id=deck_id,
            started_at=datetime.now()
        )
    
    def complete_session(self, session_data: SessionComplete) -> bool:
        # Update card statistics
        for card_id in session_data.passed_words + session_data.missed_words:
            card = next((c for c in self.cards if c.id == card_id), None)
            if card:
                card.total_attempts += 1
                card.last_reviewed_at = session_data.completed_at
                
                # Update accuracy based on whether it was passed or missed
                if card_id in session_data.passed_words:
                    correct_answers = int(card.accuracy * (card.total_attempts - 1)) + 1
                else:
                    correct_answers = int(card.accuracy * (card.total_attempts - 1))
                
                card.accuracy = correct_answers / card.total_attempts
        
        # Store session history
        self.completed_sessions.append({
            "deck_id": session_data.deck_id,
            "passed_words": session_data.passed_words,
            "missed_words": session_data.missed_words,
            "completed_at": session_data.completed_at
        })
        
        return True
    
    def get_analytics(self) -> Analytics:
        # Calculate unique cards studied
        all_studied_cards = set()
        total_correct = 0
        
        for session in self.completed_sessions:
            all_studied_cards.update(session["passed_words"])
            all_studied_cards.update(session["missed_words"])
            total_correct += len(session["passed_words"])      
        
        # Calculate study streak (simplified - consecutive days with sessions)
        session_dates = [s["completed_at"].date() for s in self.completed_sessions]
        unique_dates = sorted(set(session_dates), reverse=True)
        
        streak_days = 0
        if unique_dates:
            current_date = datetime.now().date()
            for date in unique_dates:
                if (current_date - date).days == streak_days:
                    streak_days += 1
                else:
                    break
        
        # Cards mastered (accuracy >= 0.8)
        cards_mastered = len([c for c in self.cards if c.accuracy >= 0.8])
        
        # Overall average progress (average accuracy across all cards)
        total_accuracy = sum(card.accuracy for card in self.cards)
        overall_average_progress = total_accuracy / len(self.cards) if self.cards else 0.0
        
        return Analytics(
            total_decks=len(self.decks),
            total_cards=len(self.cards),
            total_cards_studied=len(all_studied_cards),
            total_correct_answers=total_correct,
            study_streak_days=streak_days,
            cards_mastered=cards_mastered,
            overall_average_progress=round(overall_average_progress, 3)
        )

data_layer = DataLayer()