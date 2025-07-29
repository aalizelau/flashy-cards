import React from 'react';

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
    <div
      className="bg-white rounded-lg p-6 cursor-pointer hover:scale-105 transition-transform"
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-900 truncate">{collection.name}</h2>
        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{collection.category}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Words: {collection.wordCount}</span>
        <span className="text-sm text-muted-foreground">Progress: {collection.progress}%</span>
      </div>
    </div>
  );
};

export default CollectionCard;
