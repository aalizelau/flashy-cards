import React, { useState } from 'react';
import CollectionCard, { FlashcardCollection } from './CollectionCard';

const mockCollections: FlashcardCollection[] = [
  {
    id: 1,
    name: "All Words",
    wordCount: 150,
    progress: 15,
    category: "General"
  },
  {
    id: 2,
    name: "Object Pronouns",
    wordCount: 34,
    progress: 15,
    category: "Grammar"
  },
  {
    id: 3,
    name: "Verb Conjugations",
    wordCount: 45,
    progress: 32,
    category: "Grammar"
  },
  {
    id: 4,
    name: "Common Phrases",
    wordCount: 28,
    progress: 67,
    category: "Vocabulary"
  },
  {
    id: 5,
    name: "Numbers 1-100",
    wordCount: 100,
    progress: 89,
    category: "Numbers"
  },
];

const ListView: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredCollections = mockCollections.filter(collection =>
    collection.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCollectionClick = (collection: FlashcardCollection) => {
    // TODO: Navigate to collection detail page
    alert(`Clicked: ${collection.name}`);
  };

  return (
    <main className="px-6 pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search collections..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {filteredCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCollections.map(collection => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() => handleCollectionClick(collection)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">No collections found.</div>
        )}
      </div>
    </main>
  );
};

export default ListView;
