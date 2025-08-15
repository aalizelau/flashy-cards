import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import FlashcardTable from './FlashcardTable';
import { Button } from '@/shared/components/ui/button';
import { useDecks, useDeckCards } from '@/shared/hooks/useApi';
import { Card as FlashCard } from '@/shared/types/api';

const DeckDetail: React.FC = () => {
  const { collectionName } = useParams();
  const decodedName = decodeURIComponent(collectionName || '');

  const { data: decks, isLoading: decksLoading } = useDecks();
  const selectedDeck = decks?.find(deck => deck.name === decodedName);
  const deckId = selectedDeck?.id || 1;
  const { data: cards, isLoading: cardsLoading } = useDeckCards(deckId);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'progress' | 'recent' | 'alphabet' | 'attempts'>('progress');
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);

  const totalWords = cards?.length || 0;


  const playAudio = async (card: FlashCard) => {
    if (!card.audio_url) return;
    
    try {
      setPlayingAudio(card.id);
      const audio = new Audio(card.audio_url);
      
      audio.onended = () => setPlayingAudio(null);
      audio.onerror = () => {
        setPlayingAudio(null);
        console.error('Failed to play audio for:', card.front);
      };
      
      await audio.play();
    } catch (error) {
      setPlayingAudio(null);
      console.error('Audio playback failed:', error);
    }
  };

  const filteredAndSortedCards = useMemo(() => {
    if (!cards) return [];

    let filtered = cards.filter(card =>
      card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.back.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return Math.round(b.accuracy * 100) - Math.round(a.accuracy * 100);
        case 'recent':
          return new Date(b.last_reviewed_at || 0).getTime() - new Date(a.last_reviewed_at || 0).getTime();
        case 'alphabet':
          return a.front.localeCompare(b.front);
        case 'attempts':
          return b.total_attempts - a.total_attempts;
        default:
          return 0;
      }
    });
  }, [cards, searchTerm, sortBy]);

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-semibold text-foreground mt-12">
          {decodedName} ({searchTerm ? `${filteredAndSortedCards.length}/${totalWords}` : totalWords} words)
        </h2>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="hover:scale-105 transform transition-all mt-12"
        >
          ← Back to Collections
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search words..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="progress">Sort by Progress</option>
          <option value="recent">Sort by Most Recent</option>
          <option value="alphabet">Sort by Alphabet</option>
          <option value="attempts">Sort by Attempts</option>
        </select>
      </div>

      <Card className="bg-gradient-card shadow-elevated">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="p-6">
              <FlashcardTable
                cards={filteredAndSortedCards}
                playingAudio={playingAudio}
                onPlayAudio={playAudio}
              />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeckDetail;
