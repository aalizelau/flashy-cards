# Flashcard API Documentation

## Base URL
`http://localhost:8000`

## Endpoints

### 1. Get All Decks
**GET** `/decks`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Spanish Vocabulary",
    "description": "Basic Spanish words and phrases",
    "created_at": "2024-07-01T10:00:00",
    "card_count": 5
  }
]
```

### 2. Get Cards for a Deck
**GET** `/decks/{deck_id}/cards`

**Response:**
```json
[
  {
    "id": 1,
    "deck_id": 1,
    "front": "Hello",
    "back": "Hola",
    "accuracy": 0.8,
    "total_attempts": 10,
    "correct_answers": 8,
    "last_reviewed_at": "2024-07-30T15:30:00",
    "created_at": "2024-07-01T10:00:00"
  }
]
```

### 3. Start Study Session
**POST** `/study/sessions`

**Request Body:**
```json
{
  "deck_id": 1
}
```

**Response:**
```json
{
  "deck_id": 1,
  "started_at": "2024-07-31T10:00:00"
}
```

### 4. Complete Study Session
**POST** `/study/sessions/complete`

**Request Body:**
```json
{
  "deck_id": 1,
  "test_results": [
    {
      "card_id": 1,
      "remembered": true
    },
    {
      "card_id": 2, 
      "remembered": false
    },
    {
      "card_id": 3,
      "remembered": true
    }
  ]
}
```

**Response:**
```json
{
  "deck_id": 1,
  "passed_words": [1, 3],
  "missed_words": [2],
  "summary": {
    "total_cards": 3,
    "passed_count": 2,
    "missed_count": 1,
    "accuracy_percentage": 66.67
  },
  "completed_at": "2024-07-31T10:15:00"
}
```

### 5. Get Analytics
**GET** `/analytics`

**Response:**
```json
{
  "total_decks": 3,
  "total_cards": 10,
  "total_cards_studied": 8,
  "total_correct_answers": 15,
  "cards_mastered": 4,
  "overall_average_progress": 0.732
}
```

## Data Models

### TestResult
```json
{
  "card_id": "string",  // Format: "c1", "c2", etc.
  "remembered": "boolean"
}
```

### SessionSummary
```json
{
  "total_cards": "integer",
  "passed_count": "integer", 
  "missed_count": "integer",
  "accuracy_percentage": "float"
}
```

## Notes
- Accuracy percentage is calculated automatically from test results
- Card statistics are updated automatically when completing sessions