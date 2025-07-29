import React, { useState } from 'react';
import CollectionCard, { FlashcardCollection } from './CollectionCard';
import { Flashcard } from './FlashcardApp';

// Copy sampleFlashcards here since it's not exported
const sampleFlashcards: Flashcard[] = [
	{ id: '1', front: 'Hello', back: 'Hola' },
	{ id: '2', front: 'Thank you', back: 'Gracias' },
	{ id: '3', front: 'Goodbye', back: 'Adiós' },
	{ id: '4', front: 'Please', back: 'Por favor' },
	{ id: '5', front: 'Water', back: 'Agua' },
	{ id: '6', front: 'House', back: 'Casa' },
	{ id: '7', front: 'Cat', back: 'Gato' },
	{ id: '8', front: 'Dog', back: 'Perro' },
	{ id: '9', front: 'Book', back: 'Libro' },
	{ id: '10', front: 'Friend', back: 'Amigo' }
];

const mockCollections: FlashcardCollection[] = [
	{
		id: 1,
		name: 'All Words',
		wordCount: 150,
		progress: 15,
		category: 'General',
	},
	{
		id: 2,
		name: 'Object Pronouns',
		wordCount: 34,
		progress: 15,
		category: 'Grammar',
	},
	{
		id: 3,
		name: 'Verb Conjugations',
		wordCount: 45,
		progress: 32,
		category: 'Grammar',
	},
	{
		id: 4,
		name: 'Common Phrases',
		wordCount: 28,
		progress: 67,
		category: 'Vocabulary',
	},
	{
		id: 5,
		name: 'Numbers 1-100',
		wordCount: 100,
		progress: 89,
		category: 'Numbers',
	},
];

// Define FlashcardProgress here since it's not exported from FlashcardApp
interface FlashcardProgress {
	id: string;
	correctAnswers: number;
	totalAttempts: number;
	lastAttempted?: Date;
	proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered';
}

const ListView: React.FC = () => {
	const [search, setSearch] = useState('');
	const [selectedCollection, setSelectedCollection] = useState<FlashcardCollection | null>(null);
	// Use sampleFlashcards for All Words
	const [flashcards, setFlashcards] = useState<Flashcard[]>(sampleFlashcards);
	const [progressData, setProgressData] = useState<FlashcardProgress[]>(() =>
		sampleFlashcards.map(card => ({
			id: card.id,
			correctAnswers: Math.floor(Math.random() * 10),
			totalAttempts: Math.floor(Math.random() * 15) + 1,
			lastAttempted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
			proficiencyLevel: ['beginner', 'intermediate', 'advanced', 'mastered'][Math.floor(Math.random() * 4)] as any
		}))
	);

	const filteredCollections = mockCollections.filter(collection =>
		collection.name.toLowerCase().includes(search.toLowerCase())
	);

	const handleCollectionClick = (collection: FlashcardCollection) => {
		if (collection.name === 'All Words') {
			window.location.href = `/chapter/All%20Words`;
		} else {
			alert(`Clicked: ${collection.name}`);
		}
	};

	return (
		<main className="px-6 pb-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-4 mt-16">Flashcard Collections</h1>
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
						No collections found.
					</div>
				)}
			</div>
		</main>
	);
};

export default ListView;
