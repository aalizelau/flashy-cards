<div align="center">
  <img width="944" height="337" alt="Frame 10" src="https://github.com/user-attachments/assets/999b233b-c16f-4a09-b7c7-34f0dba84a2b" />
  <hr/>
  <p>
    A full-stack flashcard application with Firebase authentication, React frontend, 
    and FastAPI backend. The app provides multiple study modes including browsing, testing, 
    and reviewing flashcards with analytics and progress tracking.
  </p>

  <p>
    ✨ <a href="http://64.23.144.100/" target="_blank">Live Demo</a> ✨
  </p>
</div>



## Features

- 📚 Create and manage flashcard decks
- 🎯 Multiple study modes (Browse, Test, Review)
- 📊 Progress tracking and analytics
- 🧠 Smart testing strategies
- 🔊 Text-to-speech audio support
- 🌍 Multi-language support

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- shadcn/ui + Tailwind CSS
- React Query

- Firebase SDK

### Backend
- FastAPI + Python
- PostgreSQL database
- Redis caching
- Firebase Admin SDK
- SQLAlchemy ORM
- Alembic migrations

## Quick Start

### Docker Compose (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd flash-wise-buddy

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase and database credentials

# Start all services
docker-compose up
```

This will start:
- **Frontend**: http://localhost (port 80)
- **API**: http://localhost:8000 (port 8000)
- **Database**: PostgreSQL (port 5432)
- **Redis**: Cache server (port 6379)
- **pgAdmin**: Database admin interface at http://localhost:5050 (port 5050)

### Manual Setup

#### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.8+ (for backend)
- PostgreSQL
- Redis

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
export POSTGRES_USER=your_user
export POSTGRES_PASSWORD=your_password
export POSTGRES_DB=flashcards
export DB_HOST=localhost
export REDIS_HOST=localhost
export REDIS_PORT=6379
export FIREBASE_SERVICE_ACCOUNT_JSON='{...}'

# Initialize database
alembic upgrade head

# Start server
python main.py
```

## Development

## Project Structure

```
├── frontend/              # React frontend
│   ├── src/
│   │   ├── app/          # App entry point and routing
│   │   ├── features/     # Feature-based modules
│   │   ├── shared/       # Shared components, hooks, services
│   │   ├── pages/        # Top-level pages
│   │   └── assets/       # Static assets (images, icons)
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py       # FastAPI app entry point
│   │   ├── routers/      # API route handlers
│   │   ├── models.py     # Database models
│   │   ├── strategies/   # Testing strategies
│   │   └── database.py   # Database configuration
├── docker-compose.yml    # Multi-service setup
└── README.md
```

## API Endpoints

### Authentication
- Uses Firebase Authentication with JWT tokens

### Core Endpoints
- `GET /decks` - Get user's flashcard decks
- `GET /decks/{deck_id}/cards` - Get cards for a specific deck
- `POST /study/sessions` - Start a study session
- `POST /study/sessions/complete` - Complete session with results
- `GET /analytics` - Get user progress analytics

### API Documentation
When the backend is running, visit http://localhost:8000/docs for interactive API documentation.

## Study Modes

1. **Browser Mode**: Navigate and preview flashcards in collections
2. **Testing Mode**: Active flashcard testing with score tracking
3. **Review Mode**: Review test results and performance analytics
4. **Analytics Mode**: Overall progress tracking and statistics

## Testing Strategies

- **Test All**: Test all cards in a deck
- **Test by Decks**: Test specific deck selections
- **Test Newly Added**: Focus on recently added cards
- **Test Unfamiliar**: Target cards with low accuracy scores

## Database

The application uses PostgreSQL with the following main tables:
- `users` - User profiles and settings
- `decks` - Flashcard collections
- `cards` - Individual flashcards with progress tracking
- `study_sessions` - Session results and analytics
- `test_analytics` - Aggregated user statistics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
