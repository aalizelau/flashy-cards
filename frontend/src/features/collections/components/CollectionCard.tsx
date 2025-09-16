import React from 'react';
import { BookOpen, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export interface FlashcardCollection {
  id: number;
  name: string;
  wordCount: number;
  progress: number;
  isPublic: boolean;
  description?: string;
  originalAuthor?: string;
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
          <span className="text-lg font-medium font-Koh-Santepheap truncate">{collection.name}</span>
          <span className={`text-xs px-2 py-1 rounded ${
            collection.isPublic
              ? 'bg-gray-100 text-gray-600'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {collection.isPublic ? 'Public' : 'Private'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Original Author Attribution */}
        {collection.originalAuthor && (
          <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>Originally by {collection.originalAuthor}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="flex justify-between items-center">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default CollectionCard;