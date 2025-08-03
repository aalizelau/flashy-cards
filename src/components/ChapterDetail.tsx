import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProgressDots from './ProgressDots';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { useDecks, useDeckCards } from '@/hooks/useApi';
import { Card as FlashCard } from '@/data/flashcards';

const ChapterDetail: React.FC = () => {
  const { collectionName } = useParams();
  const decodedName = decodeURIComponent(collectionName || '');

  const { data: decks, isLoading: decksLoading } = useDecks();
  const selectedDeck = decks?.find(deck => deck.name === decodedName);
  const deckId = selectedDeck?.id || 1;
  const { data: cards, isLoading: cardsLoading } = useDeckCards(deckId);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'progress' | 'recent' | 'alphabet' | 'attempts'>('progress');

  const totalWords = cards?.length || 0;

  const getProgressPercentage = (card: FlashCard): number =>
    Math.round(card.accuracy * 100);

  const filteredAndSortedCards = useMemo(() => {
    if (!cards) return [];

    let filtered = cards.filter(card =>
      card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.back.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return getProgressPercentage(b) - getProgressPercentage(a);
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
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-separate border-spacing-y-0">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-3 text-xs font-semibold text-muted-foreground">Word</th>
                      <th className="py-2 px-3 text-xs font-semibold text-muted-foreground">Translation</th>
                      <th className="py-2 px-3 text-xs font-semibold text-muted-foreground">Progress</th>
                      <th className="py-2 px-3 text-xs font-semibold text-muted-foreground">Attempts</th>
                      <th className="py-2 px-3 text-xs font-semibold text-muted-foreground">Last Reviewed</th>
                      <th className="py-2 px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedCards.map((card, idx, arr) => {
                      const percentage = getProgressPercentage(card);
                      const lastReviewed = card.last_reviewed_at
                        ? new Date(card.last_reviewed_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—';
                      return (
                        <React.Fragment key={card.id}>
                          <tr>
                            <td className="py-3 px-3 align-middle max-w-[200px]">
                              <span className="font-medium text-sm truncate block">{card.front}</span>
                            </td>
                            <td className="py-3 px-3 align-middle max-w-[300px]">
                              <span className="text-xs text-muted-foreground truncate block">{card.back}</span>
                            </td>
                            <td className="py-3 px-3 align-middle">
                              <ProgressDots progress={percentage} />
                            </td>
                            <td className="py-3 px-3 align-middle">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                                {card.correct_answers}/{card.total_attempts}
                              </span>
                            </td>
                            <td className="py-3 px-3 align-middle">
                              <span className="text-xs text-muted-foreground">{lastReviewed}</span>
                            </td>
                            <td className="py-3 px-3 align-middle">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost" aria-label="Actions">
                                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                          {idx < arr.length - 1 && (
                            <tr>
                              <td colSpan={7}>
                                <div className="border-b border-border" />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChapterDetail;
