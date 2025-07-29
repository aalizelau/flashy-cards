import React from 'react';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface FlashcardCollection {
  id: number;
  name: string;
  wordCount: number;
  progress: number;
  category: string;
}

interface CollectionCardProps {
  collection: FlashcardCollection;
  onClick: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onClick }) => {
  return (
    <Card 
      className="cursor-pointer hover:scale-105 transition-transform shadow-card"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span className="text-lg font-medium truncate">{collection.name}</span>
          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{collection.category}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center pt-0">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4 text-gray-500" />
          <span className="text-muted-foreground">
            {collection.wordCount} words
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-gray-900 font-semibold">
            {collection.progress}%
          </span>
          <div className="w-20 h-2 bg-gray-300 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                collection.progress > 50 ? 'bg-blue-500' : 'bg-red-400'
              }`}
              style={{ width: `${collection.progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollectionCard;