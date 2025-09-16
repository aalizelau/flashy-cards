import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import CommunityCard, { CommunityDeck } from './CommunityCard';
import { apiClient } from '@/shared/services/api';
import { PublicDeck } from '@/shared/types/api';

const AllCommunityDecks: React.FC = () => {
	const [search, setSearch] = useState('');
	const [selectedLanguage, setSelectedLanguage] = useState('All');

	const languages = ['All', 'French', 'German', 'Chinese', 'English', 'Italian', 'Japanese'];

	// Language mapping for display names to database codes
	const languageMapping: { [key: string]: string } = {
		'French': 'fr',
		'German': 'de',
		'Chinese': 'zh',
		'English': 'en',
		'Italian': 'it',
		'Japanese': 'ja'
	};

	// Fetch public decks using React Query
	const { data: publicDecks = [], isLoading, error } = useQuery({
		queryKey: ['publicDecks', selectedLanguage, search],
		queryFn: () => {
			const language = selectedLanguage === 'All' ? undefined : languageMapping[selectedLanguage] || selectedLanguage.toLowerCase();
			return apiClient.getPublicDecks(language, search);
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Convert PublicDeck to CommunityDeck format for display
	const communityDecks: CommunityDeck[] = publicDecks.map(deck => ({
		id: deck.id,
		name: deck.name,
		language: deck.language,
		card_count: deck.card_count,
		author_name: deck.author_name,
		created_at: deck.created_at,
		last_modified: deck.last_modified || deck.created_at,
		is_public: deck.is_public
	}));

	const filteredDecks = communityDecks;

	const handleDeckClick = (deck: CommunityDeck) => {
		// Navigate to the community deck detail page
		window.location.href = `/community/${encodeURIComponent(deck.name)}`;
	};

	return (
		<main className="px-6 pb-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-semibold font-alumni-sans mb-4 mt-16 text-main-foreground">SHARED DECKS</h1>

				<div className="mb-10">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
						<input
							type="text"
							placeholder="Search community decks..."
							value={search}
							onChange={e => setSearch(e.target.value)}
							className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
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

				{isLoading ? (
					<div className="text-center text-muted-foreground py-12">
						Loading community decks...
					</div>
				) : error ? (
					<div className="text-center text-red-500 py-12">
						Failed to load community decks. Please try again later.
					</div>
				) : filteredDecks.length > 0 ? (
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
						{search ? 'No decks found matching your search.' : 'No community decks available.'}
					</div>
				)}
			</div>
		</main>
	);
};

export default AllCommunityDecks;