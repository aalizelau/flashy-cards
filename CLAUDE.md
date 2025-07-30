# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based flashcard application called "Flash Wise Buddy" built with Vite, TypeScript, and shadcn/ui components. The app provides multiple study modes including browsing, testing, and reviewing flashcards.

## Development Commands

```bash
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

## Architecture Overview

### Core Structure
- **Entry Point**: `src/main.tsx` → `src/App.tsx` → `src/pages/Index.tsx` → `src/components/FlashcardApp.tsx`
- **Router Setup**: Uses React Router with sidebar navigation and main content area
- **State Management**: Uses React Query for data fetching, local state for UI modes
- **UI Framework**: shadcn/ui components built on Radix UI primitives + Tailwind CSS

### Key Components Architecture

**FlashcardApp** (`src/components/FlashcardApp.tsx`)
- Main application component managing 3 modes: 'browser', 'testing', 'review'
- Handles mode transitions and test result state
- Uses sample data from `src/data/flashcards.ts`

**Navigation** (`src/components/SidebarNav.tsx`)
- Vertical sidebar with icon-based navigation
- Routes: "/" (Home), "/listview" (Browse), "/chapter/:collectionName" (Chapter Details)

**Data Layer** (`src/data/flashcards.ts`)
- TypeScript interfaces: `Flashcard`, `FlashcardResult`, `FlashcardProgress`
- Sample flashcards data (Spanish-English vocabulary)
- Progress tracking with proficiency levels

### UI Components
- Complete shadcn/ui component library in `src/components/ui/`
- Custom gradient background styling (`bg-gradient-bg`)
- Responsive design with Tailwind CSS

### Study Modes
1. **Browser Mode**: Navigate and preview flashcards
2. **Testing Mode**: Active flashcard testing with score tracking
3. **Review Mode**: Review test results and performance

## Development Guidelines

### Adding New Routes
Add routes in `src/App.tsx` above the catch-all "*" route as indicated by the comment.

### Working with Flashcards
- Flashcard data structure is defined in `src/data/flashcards.ts`
- Progress tracking includes correctness, attempts, and proficiency levels
- Sample data can be replaced with dynamic data sources

### UI Component Usage
- Use existing shadcn/ui components from `src/components/ui/`
- Follow Tailwind CSS utility classes for styling
- Maintain consistent gradient background theme

### State Management Patterns
- Mode-based state management in FlashcardApp
- React Query for server state (when implemented)
- Local state for UI interactions and temporary data