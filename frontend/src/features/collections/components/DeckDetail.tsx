import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import FlashcardTable from './FlashcardTable';
import { Button } from '@/shared/components/ui/button';
import { ArrowUp, ArrowDown, ArrowUpDown, Plus } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState<'progress' | 'recent' | 'alphabet' | 'attempts' | 'last_reviewed'>('progress');
  const [orderBy, setOrderBy] = useState<'asc' | 'desc'>('desc');
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);

  const totalWords = cards?.length || 0;

  const getSortIcon = () => {
    if (orderBy === 'asc') return <ArrowUp className="w-4 h-4" />;
    if (orderBy === 'desc') return <ArrowDown className="w-4 h-4" />;
    return <ArrowUpDown className="w-4 h-4" />;
  };

  const getOrderLabel = (sortType: string) => {
    switch (sortType) {
      case 'alphabet':
        return orderBy === 'asc' ? 'A-Z' : 'Z-A';
      case 'recent':
      case 'last_reviewed':
        return orderBy === 'asc' ? 'Oldest' : 'Newest';
      case 'attempts':
      case 'progress':
        return orderBy === 'asc' ? 'Least' : 'Most';
      default:
        return orderBy === 'asc' ? 'Ascending' : 'Descending';
    }
  };

  const handleAddCard = () => {
    console.log('Add card clicked');
  };


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
      let comparison = 0;
      switch (sortBy) {
        case 'progress':
          comparison = Math.round(b.accuracy * 100) - Math.round(a.accuracy * 100);
          break;
        case 'recent':
          comparison = new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          break;
        case 'last_reviewed':
          comparison = new Date(b.last_reviewed_at || 0).getTime() - new Date(a.last_reviewed_at || 0).getTime();
          break;
        case 'alphabet':
          comparison = a.front.localeCompare(b.front);
          break;
        case 'attempts':
          comparison = b.total_attempts - a.total_attempts;
          break;
        default:
          comparison = 0;
      }
      return orderBy === 'asc' ? -comparison : comparison;
    });
  }, [cards, searchTerm, sortBy, orderBy]);

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

      {/* Controls Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="recent">Date Added</SelectItem>
              <SelectItem value="last_reviewed">Last Reviewed</SelectItem>
              <SelectItem value="alphabet">Alphabetical</SelectItem>
              <SelectItem value="attempts">Attempts</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setOrderBy(orderBy === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2"
          >
            {getSortIcon()}
            {getOrderLabel(sortBy)}
          </Button>
        </div>

        <Button onClick={handleAddCard} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Card
        </Button>
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
