import React, { useState } from 'react';
import CommunityCard, { CommunityDeck } from './CommunityCard';

const AllCommunityDecks: React.FC = () => {
	const [search, setSearch] = useState('');
	const [selectedLanguage, setSelectedLanguage] = useState('All');

	const languages = ['All', 'French', 'German', 'Chinese', 'English', 'Italian', 'Japanese'];

	// Mock community decks data - in a real app, this would come from an API
	const communityDecks: CommunityDeck[] = [
		{
			id: 1,
			name: "Object Pronouns",
			wordCount: 34,
			author: "Fun Lau",
			lastModified: "2025-06-23",
			category: "French",
		},
		{
			id: 2,
			name: "Basic Greetings",
			wordCount: 25,
			author: "Alex Wong",
			lastModified: "2025-06-22",
			category: "German",
		},
		{
			id: 3,
			name: "Common Phrases",
			wordCount: 42,
			author: "Sarah Chen",
			lastModified: "2025-06-21",
			category: "Chinese",
		},
		{
			id: 4,
			name: "Business Vocabulary",
			wordCount: 67,
			author: "Alex Johnson",
			lastModified: "2025-06-20",
			category: "English",
		},
		{
			id: 5,
			name: "Food & Dining",
			wordCount: 38,
			author: "Hiroshi",
			lastModified: "2025-06-19",
			category: "Italian",
		},
		{
			id: 6,
			name: "Hiragana Basics",
			wordCount: 46,
			author: "Emily Wilson",
			lastModified: "2025-06-18",
			category: "Japanese",
		},
		{
			id: 7,
			name: "Past Tense Verbs",
			wordCount: 29,
			author: "Marie Dubois",
			lastModified: "2025-06-17",
			category: "French",
		},
		{
			id: 8,
			name: "Travel Essentials",
			wordCount: 31,
			author: "Hans Mueller",
			lastModified: "2025-06-16",
			category: "German",
		},
		{
			id: 9,
			name: "Numbers & Counting",
			wordCount: 24,
			author: "Li Wei",
			lastModified: "2025-06-15",
			category: "Chinese",
		},
	];

	// Filter by language first, then by search
	const languageFilteredDecks = selectedLanguage === 'All'
		? communityDecks
		: communityDecks.filter(deck => deck.category === selectedLanguage);

	const filteredDecks = languageFilteredDecks.filter(deck =>
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
				<h1 className="text-4xl font-semibold font-alumni-sans mb-4 mt-16 text-main-foreground">SHARED DECKS</h1>

				<div className="mb-10">
					<input
						type="text"
						placeholder="Search community decks..."
						value={search}
						onChange={e => setSearch(e.target.value)}
						className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>

				{/* Language Filter Tabs */}
				<div className="mb-6">
					<div className="flex space-x-8 overflow-x-auto">
						{languages.map((language) => (
							<button
								key={language}
								onClick={() => setSelectedLanguage(language)}
								className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors relative ${
									selectedLanguage === language
										? 'text-blue-600'
										: 'text-gray-500 hover:text-gray-700'
								}`}
							>
								{language}
								{selectedLanguage === language && (
									<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
								)}
							</button>
						))}
					</div>
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