import { useMemo } from 'react';
import { Card } from '@/shared/types/api';

export type SortBy = 'progress' | 'recent' | 'alphabet' | 'attempts' | 'last_reviewed';
export type OrderBy = 'asc' | 'desc';

interface UseCardFilteringProps {
  cards: Card[] | undefined;
  searchTerm: string;
  sortBy: SortBy;
  orderBy: OrderBy;
}

export const useCardFiltering = ({ cards, searchTerm, sortBy, orderBy }: UseCardFilteringProps) => {
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

  return filteredAndSortedCards;
};