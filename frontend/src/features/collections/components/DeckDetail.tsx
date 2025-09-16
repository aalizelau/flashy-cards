import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import FlashcardTable from './FlashcardTable';
import DeckMenuDropdown from './DeckMenuDropdown';
import AddCardDialog from './AddCardDialog';
import EditCardDialog from './EditCardDialog';
import ExportDeckDialog from './ExportDeckDialog';
import { Button } from '@/shared/components/ui/button';
import CardControls from '@/shared/components/CardControls';
import { useCardFiltering, SortBy, OrderBy } from '@/shared/hooks/useCardFiltering';
import { useAudioPlayback } from '@/shared/hooks/useAudioPlayback';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { GraduationCap } from 'lucide-react';
import { useDecks, useDeckCards, useDeleteDeck, useAllUserCards } from '@/shared/hooks/useApi';
import { Card as FlashCard, TestStats } from '@/shared/types/api';
import { TestConfigModal } from '@/features/test/components/Popup';
import { apiClient } from '@/shared/services/api';

const DeckDetail: React.FC = () => {
  const { collectionName } = useParams();
  const navigate = useNavigate();
  const decodedName = decodeURIComponent(collectionName || '');

  // Check if this is the "All Words" virtual deck
  const isAllWordsView = decodedName === "All Words";
  
  const { data: decks, isLoading: decksLoading } = useDecks();
  const selectedDeck = decks?.find(deck => deck.name === decodedName);
  const deckId = selectedDeck?.id;
  
  // Use different API calls based on whether it's "All Words" or a regular deck
  const { data: regularCards, isLoading: regularCardsLoading } = useDeckCards(deckId);
  const { data: allCards, isLoading: allCardsLoading } = useAllUserCards();
  
  // Choose the appropriate cards and loading state
  const cards = isAllWordsView ? allCards : regularCards;
  const cardsLoading = isAllWordsView ? allCardsLoading : regularCardsLoading;
  
  const deleteDeck = useDeleteDeck();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('progress');
  const [orderBy, setOrderBy] = useState<OrderBy>('desc');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [showEditCardDialog, setShowEditCardDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null);
  const [showTestConfig, setShowTestConfig] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [testStats, setTestStats] = useState<TestStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Use custom hooks
  const { playingAudio, playAudio } = useAudioPlayback();
  const filteredAndSortedCards = useCardFiltering({ cards, searchTerm, sortBy, orderBy });

  const totalWords = cards?.length || 0;


  const handleAddCard = () => {
    setShowAddCardDialog(true);
  };

  const handleAddCardSuccess = () => {
    // Card list will be automatically refreshed due to query invalidation
    console.log('Card added successfully');
  };

  const handleEditCard = (card: FlashCard) => {
    setEditingCard(card);
    setShowEditCardDialog(true);
  };

  const handleEditCardSuccess = () => {
    setEditingCard(null);
    setShowEditCardDialog(false);
    // Card list will be automatically refreshed due to query invalidation
    console.log('Card updated successfully');
  };

  const handleDeleteCard = (card: FlashCard) => {
    // TODO: Implement delete confirmation dialog
    console.log('Delete card:', card.id);
  };

  const handleStartTest = async () => {
    setIsLoadingStats(true);
    
    try {
      // Use different test types based on whether this is "All Words" or a regular deck
      const testType = isAllWordsView ? 'test_all' : 'test_by_decks';
      const deckIds = isAllWordsView ? [] : [deckId];
      
      const stats = await apiClient.getTestStats(testType, deckIds);
      setTestStats(stats);
      setShowTestConfig(true);
    } catch (error) {
      console.error('Failed to fetch test stats:', error);
      // Show modal anyway with fallback behavior
      setTestStats(null);
      setShowTestConfig(true);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleTestStart = (wordCount: number, swapSides: boolean) => {
    setShowTestConfig(false);
    
    // Build URL with test parameters based on whether this is "All Words" or regular deck
    const testType = isAllWordsView ? 'test_all' : 'test_by_decks';
    const params = new URLSearchParams({
      type: testType,
      limit: wordCount.toString()
    });
    
    // Only add deck_ids for regular decks, not for "All Words"
    if (!isAllWordsView) {
      params.set('deck_ids', deckId.toString());
    }
    
    // Add swap parameter if enabled
    if (swapSides) {
      params.set('swap', 'true');
    }
    
    navigate(`/test?${params.toString()}`);
  };

  const handleTestConfigClose = () => {
    setShowTestConfig(false);
  };

  const handleDuplicateDeck = () => {
    // TODO: Implement deck duplication
    console.log('Duplicate deck clicked for deck:', deckId);
  };

  const handleExportDeck = () => {
    setShowExportDialog(true);
  };

  const handleEditDeck = () => {
    navigate(`/edit-deck/${deckId}`);
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




  if (decksLoading || cardsLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-8 pb-16 max-w-5xl">
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
            disabled={isLoadingStats}
            className="flex items-center gap-2 bg-muted-foreground text-white hover:bg-main-foreground shadow-none"
          >
            <GraduationCap size={16} />
            {isLoadingStats ? 'Loading...' : 'Start Test'}
          </Button>

          {/* Deck Menu Dropdown - Limited options for All Words view */}
          <DeckMenuDropdown
            onEditDeck={handleEditDeck}
            onDuplicateDeck={handleDuplicateDeck}
            onExportDeck={handleExportDeck}
            onDeleteDeck={handleDeleteDeck}
            // For "All Words" view, only show export option
            showEdit={!isAllWordsView}
            showDuplicate={!isAllWordsView}
            showExport={true}
            showDelete={!isAllWordsView}
          />
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
            showAddButton={!isAllWordsView}
            onAddCard={handleAddCard}
          />
          
          <ScrollArea className="h-[700px]">
            <div className="px-4 py-0">
              <FlashcardTable
                cards={filteredAndSortedCards}
                playingAudio={playingAudio}
                onPlayAudio={playAudio}
                onEditCard={handleEditCard}
                onDeleteCard={handleDeleteCard}
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

      {/* Edit Card Dialog */}
      <EditCardDialog
        card={editingCard}
        open={showEditCardDialog}
        onOpenChange={setShowEditCardDialog}
        onSuccess={handleEditCardSuccess}
      />

      {/* Test Configuration Modal */}
      {showTestConfig && (isAllWordsView || selectedDeck) && (
        <TestConfigModal
          deck={isAllWordsView ? {
            id: -1,
            name: "All Words",
            is_public: false,
            created_at: "",
            progress: 0,
            card_count: totalWords
          } : selectedDeck!}
          testStats={testStats}
          testType={isAllWordsView ? "test_all" : "test_by_decks"}
          onStart={handleTestStart}
          onClose={handleTestConfigClose}
        />
      )}

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

      {/* Export Deck Dialog */}
      {showExportDialog && cards && (
        <ExportDeckDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          cards={cards}
          deckName={isAllWordsView ? "All Words" : selectedDeck?.name || "Deck"}
        />
      )}
    </div>
  );
};

export default DeckDetail;
