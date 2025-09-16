import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { ArrowUp, ArrowDown, ArrowUpDown, Plus, Search } from 'lucide-react';
import { SortBy, OrderBy } from '@/shared/hooks/useCardFiltering';

interface CardControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: SortBy;
  onSortChange: (value: SortBy) => void;
  orderBy: OrderBy;
  onOrderChange: (value: OrderBy) => void;
  showAddButton?: boolean;
  onAddCard?: () => void;
  addButtonText?: string;
}

const CardControls: React.FC<CardControlsProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  orderBy,
  onOrderChange,
  showAddButton = false,
  onAddCard,
  addButtonText = "Add New Card"
}) => {
  const getSortIcon = () => {
    if (orderBy === 'asc') return <ArrowUp className="w-4 h-4" />;
    if (orderBy === 'desc') return <ArrowDown className="w-4 h-4" />;
    return <ArrowUpDown className="w-4 h-4" />;
  };

  const getOrderLabel = (sortType: SortBy) => {
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

  const toggleOrder = () => {
    onOrderChange(orderBy === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="flex items-center justify-between py-6 px-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search words..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-44 pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortBy)}>
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
          onClick={toggleOrder}
          className="flex items-center gap-2"
        >
          {getSortIcon()}
          <span className="font-normal">{getOrderLabel(sortBy)}</span>
        </Button>
      </div>

      {showAddButton && onAddCard && (
        <Button variant="outline" onClick={onAddCard} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {addButtonText}
        </Button>
      )}
    </div>
  );
};

export default CardControls;