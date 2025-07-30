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

- `GET /decks` - Get all decks
- `GET /decks/{deck_id}/cards` - Get cards for a specific deck
- `POST /study/sessions` - Start a new study session
- `POST /study/sessions/complete` - Complete a study session
- `GET /analytics` - Get study analytics

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