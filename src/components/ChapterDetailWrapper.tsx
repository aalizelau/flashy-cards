import React from "react";
import { useParams } from "react-router-dom";
import ChapterDetail from "./ChapterDetail";
import { useDecks, useDeckCards } from "@/hooks/useApi";


const ChapterDetailWrapper: React.FC = () => {
  const { collectionName } = useParams();
  
  // Fetch decks to find the deck ID by name
  const { data: decks, isLoading: decksLoading, error: decksError } = useDecks();
  
  // Find the deck by name
  const selectedDeck = decks?.find(deck => deck.name === decodeURIComponent(collectionName || ""));
  const deckId = selectedDeck?.id || 1; // Default to deck 1 if not found
  
  // Fetch cards for the selected deck
  const { data: cards, isLoading: cardsLoading, error: cardsError } = useDeckCards(deckId);
  
  // Show loading state
  if (decksLoading || cardsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading chapter details...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (decksError || cardsError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center text-red-600 py-12">
          <h2 className="text-2xl font-bold mb-4">Error Loading Chapter</h2>
          <p className="mb-4">{decksError?.message || cardsError?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // If no deck found with the given name
  if (!selectedDeck) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Chapter Not Found</h2>
          <p className="mb-4">The chapter "{collectionName}" was not found.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <ChapterDetail
      collectionName={selectedDeck.name}
      cards={cards || []}
      deck={selectedDeck}
    />
  );
};

export default ChapterDetailWrapper;
