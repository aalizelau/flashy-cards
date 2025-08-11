# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flash Wise Buddy is a full-stack flashcard application with a React frontend and FastAPI backend. The app provides multiple study modes including browsing, testing, and reviewing flashcards with analytics and progress tracking.

## Repository Structure

```
├── frontend/          # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── app/       # App entry point and routing
│   │   ├── features/  # Feature-based modules
│   │   ├── shared/    # Shared components, hooks, services
│   │   └── pages/     # Top-level pages
│   └── package.json
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── main.py    # FastAPI app entry point
│   │   ├── routers/   # API route handlers
│   │   ├── models.py  # Database models
│   │   └── strategies/ # Testing strategies
│   └── main.py        # Server entry point
└── CLAUDE.md          # This file
```

## Development Commands

### Frontend
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Backend
```bash
cd backend

# Initialize/update database schema (required for first-time setup)
source venv/bin/activate  # Activate virtual environment
alembic upgrade head      # Apply migrations to create/update database tables

# Start development server
python main.py
# or
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run with Docker
docker-compose up
```

### Database Migrations (Alembic)
```bash
cd backend
source venv/bin/activate

# Create a new migration after model changes
alembic revision --autogenerate -m "Description of changes"

# Apply migrations to database
alembic upgrade head

# Revert to previous migration
alembic downgrade -1

# View migration history
alembic history

# View current migration version
alembic current
```

## Architecture Overview

### Frontend Architecture

**Tech Stack**: React 18 + TypeScript + Vite + shadcn/ui + Tailwind CSS + React Query

**Core Structure**:
- **Entry Point**: `src/app/main.tsx` → `src/app/App.tsx` → Router-based pages
- **Router Setup**: Uses React Router with sidebar navigation and main content area
- **Main Pages**: Dashboard (`/dashboard`), TestSession (`/study/:deckId`), Analytics (`/analytics`)
- **State Management**: React Query for server state, URL parameters for navigation state
- **UI Framework**: shadcn/ui components built on Radix UI primitives + Tailwind CSS

**Feature Structure**:
- `features/dashboard/` - Main dashboard with statistics
- `features/collections/` - Deck browsing and management
- `features/test/` - Study sessions and testing modes
- `features/analytics/` - Progress tracking and analytics
- `features/auth/` - Authentication components
- `features/deck-creation/` - Deck creation forms

**Shared Layer**:
- `shared/components/ui/` - Complete shadcn/ui component library
- `shared/services/api.ts` - API client and HTTP calls
- `shared/hooks/` - Custom React hooks
- `shared/types/` - TypeScript type definitions

### Backend Architecture

**Tech Stack**: FastAPI + Python + SQLite (via database.py)

**Core Structure**:
- **Entry Point**: `main.py` → `app/main.py` (FastAPI app)
- **API Routes**: `/decks`, `/study/sessions`, `/analytics`
- **Database**: SQLite with models in `models.py`
- **Services**: `deck_service.py`, `session_service.py`
- **Testing Strategies**: Pluggable strategies for different study modes

**API Endpoints**:
- `GET /decks` - Get all flashcard decks
- `GET /decks/{deck_id}/cards` - Get cards for a specific deck
- `POST /study/sessions` - Start a study session
- `POST /study/sessions/complete` - Complete session with results
- `GET /analytics` - Get overall progress analytics

**Testing Strategies**:
- `test_all_strategy.py` - Test all cards in a deck
- `test_by_decks_strategy.py` - Test by specific decks
- `test_newly_added_strategy.py` - Test recently added cards  
- `test_unfamiliar_strategy.py` - Test cards with low accuracy

### Data Flow

1. Frontend makes API calls via `shared/services/api.ts`
2. Backend processes requests through FastAPI routers
3. Database operations handled by service classes
4. Study session results update card statistics
5. Analytics computed from historical session data

## Development Guidelines

### Frontend Development

**Adding New Routes**:
Add routes in `src/app/App.tsx` above the catch-all "*" route.

**Working with API Data**:
- Use React Query hooks in `shared/hooks/useApi.ts`
- API client configured in `shared/services/api.ts`
- TypeScript types defined in `shared/types/api.ts`

**UI Components**:
- Use shadcn/ui components from `shared/components/ui/`
- Follow Tailwind CSS utility classes for styling
- Maintain consistent gradient background theme (`bg-gradient-bg`)

**State Management**:
- URL-based navigation state management
- React Query for server state and API data
- Local state for UI interactions and temporary data

### Backend Development

**Adding New Endpoints**:
- Create route handlers in `app/routers/`
- Register routers in `app/main.py`
- Define request/response schemas in `schemas.py`

**Database Operations**:
- Database connection in `database.py`
- Models defined in `models.py`
- Service classes handle business logic

**CORS Configuration**:
Frontend runs on `http://localhost:5173` (Vite dev server)
Backend runs on `http://localhost:8000`

### API Integration

**Base URL**: `http://localhost:8000`
**Frontend Dev Server**: `http://localhost:5173`

**Key Data Models**:
```typescript
// Frontend types
interface Deck {
  id: number;
  name: string;
  description: string;
  created_at: string;
  card_count: number;
}

interface Card {
  id: number;
  deck_id: number;
  front: string;
  back: string;
  accuracy: number;
  total_attempts: number;
  correct_answers: number;
  last_reviewed_at: string;
}

interface TestResult {
  card_id: string;
  remembered: boolean;
}
```

## Study Modes

1. **Browser Mode**: Navigate and preview flashcards in collections
2. **Testing Mode**: Active flashcard testing with score tracking
3. **Review Mode**: Review test results and performance analytics
4. **Analytics Mode**: Overall progress tracking and statistics

## Development Workflow

1. **Start Both Servers**:
   ```bash
   # Terminal 1 - Backend (first time setup requires migration)
   cd backend && source venv/bin/activate && alembic upgrade head && python main.py
   
   # Terminal 2 - Frontend  
   cd frontend && npm run dev
   ```

2. **Making Changes**:
   - Frontend changes auto-reload via Vite HMR
   - Backend changes require server restart (or use `--reload`)
   - API changes require updating both frontend types and backend schemas
   - **Database schema changes**: Update models in `app/models.py`, then run `alembic revision --autogenerate -m "Description"` and `alembic upgrade head`

3. **Testing**:
   - Frontend: Use browser dev tools and React dev tools
   - Backend: FastAPI auto-generates docs at `http://localhost:8000/docs`
   - API testing via Swagger UI or API client

## Notes

- Frontend uses Vite for fast development and building
- Backend uses FastAPI for automatic API documentation
- Database is SQLite for simplicity (configurable)
- CORS is configured for local development
- Progress tracking includes accuracy, attempts, and proficiency levels
- Multiple testing strategies available for different study approaches