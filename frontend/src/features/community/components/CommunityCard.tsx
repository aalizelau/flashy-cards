import React from 'react';
import { User, Heart, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export interface CommunityDeck {
  id: number;
  name: string;
  language: string;
  card_count: number;
  author_name: string;
  created_at: string;
  last_modified?: string;
  is_public: boolean;
  description?: string;
}

interface CommunityCardProps {
  deck: CommunityDeck;
  onClick: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ deck, onClick }) => {
  return (
    <Card
      className="cursor-pointer hover:scale-105 transition-transform shadow-card rounded-xl"
      onClick={onClick}
    >
      <CardHeader className="pb-1">
        <CardTitle className="flex justify-between items-center">
          <span className="text-lg font-medium font-Koh-Santepheap truncate">{deck.name}</span>

          <Heart className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-8">
          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 flex items-center space-x-1 w-fit">
            <BookOpen className="h-3 w-3" />
            <span>{deck.card_count} cards</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-muted-foreground text-sm">
              {deck.author_name}
            </span>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-muted-foreground text-sm">
              {deck.last_modified
                ? new Date(deck.last_modified).toLocaleDateString()
                : new Date(deck.created_at).toLocaleDateString()
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityCard;