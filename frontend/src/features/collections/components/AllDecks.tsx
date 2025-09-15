import React, { useState } from 'react';
import { Search } from 'lucide-react';
import CollectionCard, { FlashcardCollection } from './CollectionCard';
import { useDecks } from '@/shared/hooks/useApi';




const AllDecks: React.FC = () => {
	const [search, setSearch] = useState('');
	
	// Fetch decks from API
	const { data: decks, isLoading, error } = useDecks();
	
	// Convert API decks to FlashcardCollection format
	const regularCollections: FlashcardCollection[] = decks?.map(deck => ({
		id: deck.id,
		name: deck.name,
		wordCount: deck.card_count,
		progress: Math.floor(deck.progress * 100), // TODO: Calculate real progress from analytics
		category: 'Vocabulary', // Default category, could be enhanced
	})) || [];

	// Create "All Words" virtual deck if user has any decks
	const allWordsCollection: FlashcardCollection | null = decks && decks.length > 0 ? {
		id: -1, // Special ID for virtual deck
		name: "All Words",
		wordCount: decks.reduce((total, deck) => total + deck.card_count, 0),
		progress: Math.floor(decks.reduce((sum, deck) => sum + (deck.progress * deck.card_count), 0) / 
			Math.max(1, decks.reduce((total, deck) => total + deck.card_count, 0)) * 100),
		category: 'Browse All',
	} : null;

	// Combine collections with "All Words" at the top
	const collections: FlashcardCollection[] = allWordsCollection 
		? [allWordsCollection, ...regularCollections]
		: regularCollections;

	const filteredCollections = collections.filter(collection =>
		collection.name.toLowerCase().includes(search.toLowerCase())
	);

	const handleCollectionClick = (collection: FlashcardCollection) => {
		// Navigate to the deck detail page with the collection name
		window.location.href = `/decks/${encodeURIComponent(collection.name)}`;
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
				<h1 className="text-4xl font-semibold font-alumni-sans mb-4 mt-16 text-main-foreground">YOUR COLLECTIONS</h1>
				<div className="mb-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
						<input
							type="text"
							placeholder="Search collections..."
							value={search}
							onChange={e => setSearch(e.target.value)}
							className="w-full pl-10 pr-3 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
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

export default AllDecks;
