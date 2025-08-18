import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { MoreHorizontal, Copy, Download, Trash2, Edit } from 'lucide-react';

interface DeckMenuDropdownProps {
  onEditDeck?: () => void;
  onDuplicateDeck?: () => void;
  onExportDeck?: () => void;
  onDeleteDeck?: () => void;
}

const DeckMenuDropdown: React.FC<DeckMenuDropdownProps> = ({
  onEditDeck,
  onDuplicateDeck,
  onExportDeck,
  onDeleteDeck,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors shadow-sm"
          aria-label="Deck options"
        >
          <MoreHorizontal size={16} className="text-gray-700" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 bg-white border border-gray-200"
        sideOffset={8}
      >
        <DropdownMenuItem 
          className="hover:bg-gray-100 cursor-pointer flex items-center gap-2 px-4"
          onClick={onEditDeck}
        >
          <Edit className="w-4 h-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="hover:bg-gray-100 cursor-pointer flex items-center gap-2 px-4"
          onClick={onDuplicateDeck}
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="hover:bg-gray-100 cursor-pointer flex items-center gap-2 px-4"
          onClick={onExportDeck}
        >
          <Download className="w-4 h-4" />
          Export
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="hover:bg-red-100 text-red-600 cursor-pointer flex items-center gap-2 px-4"
          onClick={onDeleteDeck}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DeckMenuDropdown;