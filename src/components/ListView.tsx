import React, { useState } from 'react';
import CollectionCard, { FlashcardCollection } from './CollectionCard';
import { useDecks } from '@/hooks/useApi';




const ListView: React.FC = () => {
	const [search, setSearch] = useState('');
	
	// Fetch decks from API
	const { data: decks, isLoading, error } = useDecks();
	
	// Convert API decks to FlashcardCollection format
	const collections: FlashcardCollection[] = decks?.map(deck => ({
		id: deck.id,
		name: deck.name,
		wordCount: deck.card_count,
		progress: Math.floor(deck.progress * 100), // TODO: Calculate real progress from analytics
		category: 'Vocabulary', // Default category, could be enhanced
	})) || [];

	const filteredCollections = collections.filter(collection =>
		collection.name.toLowerCase().includes(search.toLowerCase())
	);

	const handleCollectionClick = (collection: FlashcardCollection) => {
		// Navigate to the chapter detail page with the collection name
		window.location.href = `/chapter/${encodeURIComponent(collection.name)}`;
	};

	// Show loading state
	if (isLoading) {
		return (
			<main className="px-6 pb-8">
				<div className="max-w-4xl mx-auto">
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
						<p className="mt-4 text-lg">Loading collections...</p>
					</div>
				</div>
			</main>
		);
	}

	// Show error state
	if (error) {
		return (
			<main className="px-6 pb-8">
				<div className="max-w-4xl mx-auto">
					<div className="text-center text-red-600 py-12">
						<h2 className="text-2xl font-bold mb-4">Error Loading Collections</h2>
						<p className="mb-4">{error.message}</p>
						<button 
							onClick={() => window.location.reload()}
							className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
						>
							Retry
						</button>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="px-6 pb-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-semibold mb-4 mt-16">Flashcard Collections</h1>
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
					<div className="text-center text-muted-foreground py-12">
						{collections.length === 0 ? 'No collections available.' : 'No collections found matching your search.'}
					</div>
				)}
			</div>
		</main>
	);
};

export default ListView;
