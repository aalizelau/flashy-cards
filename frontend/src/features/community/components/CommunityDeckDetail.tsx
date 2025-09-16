import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Button } from '@/shared/components/ui/button';
import { Loader2, GraduationCap, Download, User, BookOpen } from 'lucide-react';
import { apiClient } from '@/shared/services/api';
import { Card as FlashCard } from '@/shared/types/api';
import FlashcardTable from '@/features/collections/components/FlashcardTable';
import CardControls from '@/shared/components/CardControls';
import { useCardFiltering, SortBy, OrderBy } from '@/shared/hooks/useCardFiltering';
import { useAudioPlayback } from '@/shared/hooks/useAudioPlayback';

const CommunityDeckDetail: React.FC = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const numericDeckId = parseInt(deckId || '0');

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('progress');
  const [orderBy, setOrderBy] = useState<OrderBy>('desc');

  // Use custom hooks
  const { playingAudio, playAudio } = useAudioPlayback();

  // Fetch public deck cards
  const { data: cards = [], isLoading: cardsLoading, error } = useQuery({
    queryKey: ['publicDeckCards', numericDeckId],
    queryFn: () => apiClient.getPublicDeckCards(numericDeckId),
    enabled: !!numericDeckId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get deck info from community decks list (cached)
  const { data: publicDecks = [] } = useQuery({
    queryKey: ['publicDecks'],
    queryFn: () => apiClient.getPublicDecks(),
    staleTime: 5 * 60 * 1000,
  });

  const deck = publicDecks.find(d => d.id === numericDeckId);

  // Copy deck mutation
  const copyDeckMutation = useMutation({
    mutationFn: (deckId: number) => apiClient.copyPublicDeck(deckId),
    onSuccess: (newDeck) => {
      // Invalidate user's decks to refresh the list
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      // Navigate to the new deck
      navigate(`/decks/${encodeURIComponent(newDeck.name)}`);
    },
    onError: (error) => {
      console.error('Failed to copy deck:', error);
      // TODO: Show error toast
    },
  });

  // Use filtering hook
  const filteredAndSortedCards = useCardFiltering({ cards, searchTerm, sortBy, orderBy });

  const totalWords = cards?.length || 0;

  const handleCopyDeck = () => {
    if (numericDeckId) {
      copyDeckMutation.mutate(numericDeckId);
    }
  };

  const handleBack = () => {
    navigate('/community');
  };

  if (cardsLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading deck...</p>
        </div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="container mx-auto px-4 pt-8 pb-16 max-w-5xl">
        <div className="text-center py-12">
          <p className="text-lg text-red-500">
            {error ? 'Failed to load deck. Please try again later.' : 'Deck not found.'}
          </p>
          <Button
            variant="outline"
            onClick={handleBack}
            className="mt-4"
          >
            ← Back to Community
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-8 pb-16 max-w-5xl">
      <Button
        variant="outline"
        onClick={handleBack}
        className="gap-2 px-3 mb-6"
      >
        ← Back to Community
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-4xl font-alumni-sans font-semibold text-main-foreground uppercase">
            {deck.name}
            <span className="normal-case ml-2">
              ({searchTerm ? `${filteredAndSortedCards.length}/${totalWords}` : totalWords} words)
            </span>
          </h2>

          {/* Deck metadata */}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>by {deck.author_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{deck.language.toUpperCase()}</span>
            </div>
            <span>
              Created {new Date(deck.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Save to Collection Button */}
          <Button
            onClick={handleCopyDeck}
            disabled={copyDeckMutation.isPending}
            className="flex items-center gap-2 bg-main-foreground text-white hover:bg-main-foreground/90"
          >
            {copyDeckMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Save to My Collection
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-card shadow-elevated">
        <CardContent className="p-0">
          {/* Controls Section */}
          <CardControls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            orderBy={orderBy}
            onOrderChange={setOrderBy}
            showAddButton={false} // No add button in read-only view
          />

          <ScrollArea className="h-[700px]">
            <div className="px-4 py-0">
              <FlashcardTable
                cards={filteredAndSortedCards}
                playingAudio={playingAudio}
                onPlayAudio={playAudio}
                readOnly={true} // Read-only mode
              />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityDeckDetail;