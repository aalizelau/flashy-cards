import React, { useState } from 'react';
import CommunityCard, { CommunityDeck } from './CommunityCard';

const AllCommunityDecks: React.FC = () => {
	const [search, setSearch] = useState('');

	// Mock community decks data - in a real app, this would come from an API
	const communityDecks: CommunityDeck[] = [
		{
			id: 1,
			name: "Spanish Essentials",
			wordCount: 500,
			author: "Fun Lau",
			lastModified: "2025-06-09",
			category: "Language",
		},
		{
			id: 2,
			name: "French Vocabulary",
			wordCount: 350,
			author: "Alex Wong",
			lastModified: "2025-06-08",
			category: "Language",
		},
		{
			id: 3,
			name: "Medical Terminology",
			wordCount: 800,
			author: "Sarah Chen",
			lastModified: "2025-06-07",
			category: "Medical",
		},
		{
			id: 4,
			name: "Programming Concepts",
			wordCount: 200,
			author: "Alex Johnson",
			lastModified: "2025-06-05",
			category: "Technology",
		},
		{
			id: 5,
			name: "Japanese Kanji",
			wordCount: 1000,
			author: "Hiroshi",
			lastModified: "2025-06-03",
			category: "Language",
		},
		{
			id: 6,
			name: "Chemistry Basics",
			wordCount: 300,
			author: "Emily Wilson",
			lastModified: "2025-06-01",
			category: "Science",
		},
	];

	const filteredDecks = communityDecks.filter(deck =>
		deck.name.toLowerCase().includes(search.toLowerCase()) ||
		deck.author.toLowerCase().includes(search.toLowerCase()) ||
		deck.category.toLowerCase().includes(search.toLowerCase())
	);

	const handleDeckClick = (deck: CommunityDeck) => {
		// Navigate to the community deck detail page
		window.location.href = `/community/${encodeURIComponent(deck.name)}`;
	};

	return (
		<main className="px-6 pb-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-semibold font-alumni-sans mb-4 mt-16 text-main-foreground">COMMUNITY DECKS</h1>
				<div className="mb-6">
					<input
						type="text"
						placeholder="Search community decks..."
						value={search}
						onChange={e => setSearch(e.target.value)}
						className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
				{filteredDecks.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{filteredDecks.map(deck => (
							<CommunityCard
								key={deck.id}
								deck={deck}
								onClick={() => handleDeckClick(deck)}
							/>
						))}
					</div>
				) : (
					<div className="text-center text-muted-foreground py-12">
						{communityDecks.length === 0 ? 'No community decks available.' : 'No decks found matching your search.'}
					</div>
				)}
			</div>
		</main>
	);
};

export default AllCommunityDecks;