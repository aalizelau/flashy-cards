# Flashcard Backend API

FastAPI backend for a flashcard application with deck, card, and study session management.

## Setup

```bash
# Install dependencies
pip install fastapi uvicorn pydantic

# Run development server
uvicorn main:app --reload

# Run with specific host and port
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Testing

```bash
# Run tests (when available)
pytest

# Run with coverage
pytest --cov=app
```

## API Endpoints

- `GET /decks` - Get all decks with metadata
- `GET /decks/{deck_id}/cards` - Get cards for a specific deck with accuracy stats
- `POST /study/sessions` - Start a new study session (body: `{"deck_id": int}`)
- `POST /study/sessions/complete` - Complete a study session with results
- `GET /analytics` - Get comprehensive study analytics

### Session Complete Payload Example

```json
{
  "deck_id": 1,
  "passed_words": [1, 2, 3],
  "missed_words": [4, 5],
  "summary": {
    "total_cards": 5,
    "passed_count": 3,
    "missed_count": 2,
    "accuracy_percentage": 60.0,
    "session_duration_minutes": 5.5
  },
  "completed_at": "2024-01-15T10:30:00"
}
```

### Analytics Response Example

```json
{
  "total_decks": 3,
  "total_cards": 10,
  "total_cards_studied": 8,
  "total_correct_answers": 15,
  "study_streak_days": 3,
  "cards_mastered": 4,
  "overall_average_progress": 0.735
}
```

## Development

```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .
```

## Project Structure

```
app/
├── main.py              # FastAPI app and routes
├── models.py            # Pydantic models
├── data.py              # Dummy data and data layer
└── __init__.py
```