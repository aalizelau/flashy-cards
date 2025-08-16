import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import FlashcardTable from './FlashcardTable';
import DeckMenuDropdown from './DeckMenuDropdown';
import AddCardDialog from './AddCardDialog';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ArrowUp, ArrowDown, ArrowUpDown, Plus, GraduationCap, Search, ArrowLeft } from 'lucide-react';
import { useDecks, useDeckCards, useDeleteDeck } from '@/shared/hooks/useApi';
import { Card as FlashCard } from '@/shared/types/api';

const DeckDetail: React.FC = () => {
  const { collectionName } = useParams();
  const navigate = useNavigate();
  const decodedName = decodeURIComponent(collectionName || '');

  const { data: decks, isLoading: decksLoading } = useDecks();
  const selectedDeck = decks?.find(deck => deck.name === decodedName);
  const deckId = selectedDeck?.id || 1;
  const { data: cards, isLoading: cardsLoading } = useDeckCards(deckId);
  const deleteDeck = useDeleteDeck();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'progress' | 'recent' | 'alphabet' | 'attempts' | 'last_reviewed'>('progress');
  const [orderBy, setOrderBy] = useState<'asc' | 'desc'>('desc');
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);

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
    setShowAddCardDialog(true);
  };

  const handleAddCardSuccess = () => {
    // Card list will be automatically refreshed due to query invalidation
    console.log('Card added successfully');
  };

  const handleStartTest = () => {
    // TODO: Navigate to test page for this deck
    console.log('Start test clicked for deck:', deckId);
  };

  const handleDuplicateDeck = () => {
    // TODO: Implement deck duplication
    console.log('Duplicate deck clicked for deck:', deckId);
  };

  const handleExportDeck = () => {
    // TODO: Implement deck export
    console.log('Export deck clicked for deck:', deckId);
  };

  const handleDeleteDeck = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteDeck = async () => {
    try {
      await deleteDeck.mutateAsync(deckId);
      setShowDeleteDialog(false);
      // Navigate back to all decks after successful deletion
      navigate('/all-decks');
    } catch (error) {
      console.error('Failed to delete deck:', error);
      // You could add toast notification here
    }
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
      <Button
        variant="outline"
        onClick={() => navigate('/all-decks')}
        className="gap-2 px-3"
      >
        ← Back
      </Button>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-4xl font-alumni-sans font-semibold text-main-foreground mt-12 uppercase">
          <span className="uppercase">{decodedName}</span>{" "}
          <span className="normal-case">({searchTerm ? `${filteredAndSortedCards.length}/${totalWords}` : totalWords} words)</span>
        </h2>
        <div className="flex items-center gap-4 mt-12">
          {/* Start Test Button */}
          <Button 
            onClick={handleStartTest}
            className="flex items-center gap-2 bg-muted-foreground text-white hover:bg-main-foreground shadow-none"
          >
            <GraduationCap size={16} />
            Start Test
          </Button>

          {/* Deck Menu Dropdown */}
          <DeckMenuDropdown
            onDuplicateDeck={handleDuplicateDeck}
            onExportDeck={handleExportDeck}
            onDeleteDeck={handleDeleteDeck}
          />
        </div>
      </div>

      <Card className="bg-gradient-card shadow-elevated">
        <CardContent className="p-0">
          {/* Controls Section */}
          <div className="flex items-center justify-between py-6 px-4 ">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search words..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-44 pl-10"
                />
              </div>
              
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="w-36">
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
                <span className="font-normal">{getOrderLabel(sortBy)}</span>
              </Button>
            </div>

            <Button variant="outline" onClick={handleAddCard} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Card
            </Button>
          </div>
          
          <ScrollArea className="h-[600px]">
            <div className="px-4 py-0">
              <FlashcardTable
                cards={filteredAndSortedCards}
                playingAudio={playingAudio}
                onPlayAudio={playAudio}
              />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Card Dialog */}
      <AddCardDialog
        deckId={deckId}
        open={showAddCardDialog}
        onOpenChange={setShowAddCardDialog}
        onSuccess={handleAddCardSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deck</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{decodedName}"? This action cannot be undone and will permanently delete all {totalWords} cards in this deck.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteDeck.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDeck}
              disabled={deleteDeck.isPending}
            >
              {deleteDeck.isPending ? 'Deleting...' : 'Delete Deck'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeckDetail;
