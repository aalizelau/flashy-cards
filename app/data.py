from datetime import datetime, timedelta
from typing import List, Optional
from .models import Deck, Card, StudySession, SessionCard, DifficultyLevel, SessionStatus, Analytics

dummy_decks = [
    Deck(
        id=1,
        name="Spanish Vocabulary",
        description="Basic Spanish words and phrases",
        created_at=datetime.now() - timedelta(days=30),
        card_count=15
    ),
    Deck(
        id=2,
        name="Python Programming",
        description="Python concepts and syntax",
        created_at=datetime.now() - timedelta(days=20),
        card_count=12
    ),
    Deck(
        id=3,
        name="History Facts",
        description="Important historical events",
        created_at=datetime.now() - timedelta(days=10),
        card_count=8
    )
]

dummy_cards = [
    # Spanish deck cards
    Card(id=1, deck_id=1, front="Hello", back="Hola", difficulty=DifficultyLevel.EASY, created_at=datetime.now() - timedelta(days=30)),
    Card(id=2, deck_id=1, front="Goodbye", back="Adiós", difficulty=DifficultyLevel.EASY, created_at=datetime.now() - timedelta(days=30)),
    Card(id=3, deck_id=1, front="Thank you", back="Gracias", difficulty=DifficultyLevel.EASY, created_at=datetime.now() - timedelta(days=29)),
    Card(id=4, deck_id=1, front="Good morning", back="Buenos días", difficulty=DifficultyLevel.MEDIUM, created_at=datetime.now() - timedelta(days=29)),
    Card(id=5, deck_id=1, front="How are you?", back="¿Cómo estás?", difficulty=DifficultyLevel.MEDIUM, created_at=datetime.now() - timedelta(days=28)),
    
    # Python deck cards
    Card(id=6, deck_id=2, front="What is a list comprehension?", back="A concise way to create lists: [x for x in iterable]", difficulty=DifficultyLevel.MEDIUM, created_at=datetime.now() - timedelta(days=20)),
    Card(id=7, deck_id=2, front="What does 'self' refer to?", back="The instance of the class", difficulty=DifficultyLevel.EASY, created_at=datetime.now() - timedelta(days=20)),
    Card(id=8, deck_id=2, front="What is a decorator?", back="A function that modifies another function", difficulty=DifficultyLevel.HARD, created_at=datetime.now() - timedelta(days=19)),
    
    # History deck cards
    Card(id=9, deck_id=3, front="When did World War II end?", back="1945", difficulty=DifficultyLevel.EASY, created_at=datetime.now() - timedelta(days=10)),
    Card(id=10, deck_id=3, front="Who was the first president of the US?", back="George Washington", difficulty=DifficultyLevel.EASY, created_at=datetime.now() - timedelta(days=9)),
]

dummy_sessions = [
    StudySession(id=1, deck_id=1, started_at=datetime.now() - timedelta(hours=2), status=SessionStatus.COMPLETED),
    StudySession(id=2, deck_id=2, started_at=datetime.now() - timedelta(minutes=30), status=SessionStatus.ACTIVE),
]

dummy_session_cards = [
    SessionCard(session_id=1, card_id=1, shown_at=datetime.now() - timedelta(hours=2), response=DifficultyLevel.EASY),
    SessionCard(session_id=1, card_id=2, shown_at=datetime.now() - timedelta(hours=2, minutes=5), response=DifficultyLevel.MEDIUM),
    SessionCard(session_id=2, card_id=6, shown_at=datetime.now() - timedelta(minutes=30), response=None),
]

class DataLayer:
    def __init__(self):
        self.decks = dummy_decks.copy()
        self.cards = dummy_cards.copy()
        self.sessions = dummy_sessions.copy()
        self.session_cards = dummy_session_cards.copy()
        self._next_session_id = 3
    
    def get_all_decks(self) -> List[Deck]:
        return self.decks
    
    def get_cards_by_deck_id(self, deck_id: int) -> List[Card]:
        return [card for card in self.cards if card.deck_id == deck_id]
    
    def create_session(self, deck_id: int) -> StudySession:
        session = StudySession(
            id=self._next_session_id,
            deck_id=deck_id,
            started_at=datetime.now(),
            status=SessionStatus.ACTIVE
        )
        self.sessions.append(session)
        self._next_session_id += 1
        return session
    
    def get_session_by_id(self, session_id: int) -> Optional[StudySession]:
        for session in self.sessions:
            if session.id == session_id:
                return session
        return None
    
    def complete_session(self, session_id: int, completed_cards: List[SessionCard]) -> bool:
        session = self.get_session_by_id(session_id)
        if not session:
            return False
        
        session.status = SessionStatus.COMPLETED
        
        for card in completed_cards:
            card.session_id = session_id
            self.session_cards.append(card)
        
        return True
    
    def get_analytics(self) -> Analytics:
        completed_sessions = [s for s in self.sessions if s.status == SessionStatus.COMPLETED]
        today = datetime.now().date()
        cards_today = [sc for sc in self.session_cards 
                      if sc.shown_at.date() == today and sc.response is not None]
        
        total_duration = sum(
            [(datetime.now() - s.started_at).total_seconds() / 60 
             for s in completed_sessions],
            0
        )
        avg_duration = total_duration / len(completed_sessions) if completed_sessions else 0
        
        return Analytics(
            total_decks=len(self.decks),
            total_cards=len(self.cards),
            total_sessions=len(self.sessions),
            completed_sessions=len(completed_sessions),
            cards_studied_today=len(cards_today),
            average_session_duration_minutes=round(avg_duration, 2)
        )

data_layer = DataLayer()