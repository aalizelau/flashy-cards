import React, { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { apiClient } from '@/shared/services/api';
import { DeckWithCardsCreate, CardCreate } from '@/shared/types/api';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { LANGUAGES } from '@/shared/components/LanguageSelector';
import ImportModeToggle from './ImportModeToggle';
import IndividualCardsSection from './IndividualCardsSection';
import BulkImportSection from './BulkImportSection';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  example_sentence_1?: string;
  sentence_translation_1?: string;
  example_sentence_2?: string;
  sentence_translation_2?: string;
}

type ImportMode = 'individual' | 'bulk';
type TermDelimiter = 'tab' | 'comma' | 'pipe' | 'semicolon' | 'custom';
type CardDelimiter = 'newline' | 'double-newline' | 'custom';


function CreateDeck() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [deckTitle, setDeckTitle] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('individual');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { id: '1', front: '', back: '' }
  ]);
  const [bulkText, setBulkText] = useState('');
  const [termDelimiter, setTermDelimiter] = useState<TermDelimiter>('tab');
  const [cardDelimiter, setCardDelimiter] = useState<CardDelimiter>('newline');
  const [customTermDelimiter, setCustomTermDelimiter] = useState('');
  const [customCardDelimiter, setCustomCardDelimiter] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isPublic, setIsPublic] = useState(false);

  // Helper function to get language display name
  const getLanguageDisplayName = (languageCode?: string | null): string => {
    if (!languageCode) return '';
    const language = LANGUAGES.find(lang => lang.code === languageCode);
    return language ? language.name : '';
  };

  const languageDisplay = getLanguageDisplayName(userProfile?.selected_language);


  const getDelimiterChar = (delimiter: TermDelimiter): string => {
    switch (delimiter) {
      case 'tab': return '\t';
      case 'comma': return ',';
      case 'pipe': return '|';
      case 'semicolon': return ';';
      case 'custom': return customTermDelimiter || '\t';
      default: return '\t';
    }
  };

  const getCardSeparator = (delimiter: CardDelimiter): string => {
    switch (delimiter) {
      case 'newline': return '\n';
      case 'double-newline': return '\n\n';
      case 'custom': return customCardDelimiter || '\n';
      default: return '\n';
    }
  };

  const parseBulkText = (text: string): Flashcard[] => {
    if (!text.trim()) return [];
    
    const cardSeparator = getCardSeparator(cardDelimiter);
    const termDelimiterChar = getDelimiterChar(termDelimiter);
    
    const lines = text.split(cardSeparator).filter(line => line.trim());
    
    return lines.map((line, index) => {
      const parts = line.split(termDelimiterChar);
      const front = parts[0]?.trim() || '';
      const back = parts[1]?.trim() || '';
      
      // Handle optional sentence fields
      const example_sentence_1 = parts[2]?.trim() || undefined;
      const sentence_translation_1 = parts[3]?.trim() || undefined;
      const example_sentence_2 = parts[4]?.trim() || undefined;
      const sentence_translation_2 = parts[5]?.trim() || undefined;
      
      return {
        id: `bulk-${index}-${Date.now()}`,
        front,
        back,
        ...(example_sentence_1 && { example_sentence_1 }),
        ...(sentence_translation_1 && { sentence_translation_1 }),
        ...(example_sentence_2 && { example_sentence_2 }),
        ...(sentence_translation_2 && { sentence_translation_2 }),
      };
    }).filter(card => card.front && card.back); // Only include cards with both front and back
  };

  const bulkCards = parseBulkText(bulkText);
  const hasValidFormat = bulkText.trim() && bulkCards.length > 0;

  const addFlashcard = () => {
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: '',
      back: '',
      example_sentence_1: undefined,
      sentence_translation_1: undefined,
      example_sentence_2: undefined,
      sentence_translation_2: undefined
    };
    setFlashcards([...flashcards, newCard]);
  };

  const removeFlashcard = (id: string) => {
    if (flashcards.length > 1) {
      setFlashcards(flashcards.filter(card => card.id !== id));
    }
  };

  const updateFlashcard = (id: string, field: 'front' | 'back' | 'example_sentence_1' | 'sentence_translation_1' | 'example_sentence_2' | 'sentence_translation_2', value: string) => {
    setFlashcards(flashcards.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ));
  };

  const toggleCardExpansion = (id: string) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(id)) {
      newExpandedCards.delete(id);
    } else {
      newExpandedCards.add(id);
    }
    setExpandedCards(newExpandedCards);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!deckTitle.trim()) {
      newErrors.deckTitle = 'Deck title is required';
    }
    
    if (importMode === 'individual') {
      const validCards = flashcards.filter(card => card.front.trim() || card.back.trim());
      if (validCards.length === 0) {
        newErrors.flashcards = 'At least one flashcard with content is required';
      }
    } else {
      if (termDelimiter === 'custom' && !customTermDelimiter.trim()) {
        newErrors.customTermDelimiter = 'Custom term delimiter is required';
      }
      if (cardDelimiter === 'custom' && !customCardDelimiter.trim()) {
        newErrors.customCardDelimiter = 'Custom card delimiter is required';
      }
      if (!hasValidFormat) {
        newErrors.bulkText = 'Please enter valid text to create flashcards';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const cardsToSubmit = importMode === 'individual' 
        ? flashcards.filter(card => card.front.trim() && card.back.trim())
        : bulkCards.filter(card => card.front.trim() && card.back.trim());
      
      // Transform to API format
      const apiCards: CardCreate[] = cardsToSubmit.map(card => ({
        front: card.front.trim(),
        back: card.back.trim(),
        ...(card.example_sentence_1 && { example_sentence_1: card.example_sentence_1.trim() }),
        ...(card.sentence_translation_1 && { sentence_translation_1: card.sentence_translation_1.trim() }),
        ...(card.example_sentence_2 && { example_sentence_2: card.example_sentence_2.trim() }),
        ...(card.sentence_translation_2 && { sentence_translation_2: card.sentence_translation_2.trim() })
      }));

      const deckData: DeckWithCardsCreate = {
        name: deckTitle.trim(),
        cards: apiCards
      };

      // Mock: Log the public deck setting (no actual API integration)
      if (isPublic) {
        console.log('Deck will be set as public:', deckData.name);
      }

      const response = await apiClient.createDeckWithCards(deckData);
      
      // Navigate to the newly created deck detail page
      navigate(`/decks/${encodeURIComponent(response.name)}`);
      
    } catch (error) {
      console.error('Failed to create deck:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create deck. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-bg from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className=" mb-8">
          <div className="flex items-center justify-between gap-3 mb-4 mt-10">
            <h1 className="text-4xl font-semibold font-alumni-sans text-main-foreground">CREATE A NEW DECK</h1>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-md font-regular h-12"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Create
                </>
              )}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={`space-y-8 ${isLoading ? 'pointer-events-none opacity-70' : ''}`}>
          {/* Deck Title */}
          <div>
            <label htmlFor="deckTitle" className="block text-md font-semibold text-gray-700 mb-3">
              Deck Title
            </label>
            <input
              type="text"
              id="deckTitle"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              placeholder="e.g., Food Vocabulary, Travel Phrases, Common Greetings"
              className={`w-full px-4 py-2 text-lg border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                errors.deckTitle 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
            />
            {errors.deckTitle && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                {errors.deckTitle}
              </p>
            )}
          </div>

          {/* Public Deck Toggle */}
          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-3">
              Set as public
            </h3>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic
                    ? 'bg-muted-foreground'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <label className="text-sm text-gray-600 cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
                Allow other users to discover and use this deck
              </label>
            </div>
          </div>

          {/* Import Mode Toggle */}
          <ImportModeToggle 
            importMode={importMode}
            onModeChange={setImportMode}
          />

          {/* Individual Cards Mode */}
          {importMode === 'individual' && (
            <IndividualCardsSection 
              flashcards={flashcards}
              errors={errors}
              languageDisplay={languageDisplay}
              expandedCards={expandedCards}
              onUpdateFlashcard={updateFlashcard}
              onRemoveFlashcard={removeFlashcard}
              onAddFlashcard={addFlashcard}
              onToggleExpansion={toggleCardExpansion}
            />
          )}

          {/* Bulk Import Mode */}
          {importMode === 'bulk' && (
            <BulkImportSection 
              bulkText={bulkText}
              termDelimiter={termDelimiter}
              cardDelimiter={cardDelimiter}
              customTermDelimiter={customTermDelimiter}
              customCardDelimiter={customCardDelimiter}
              errors={errors}
              languageDisplay={languageDisplay}
              bulkCards={bulkCards}
              hasValidFormat={hasValidFormat}
              onBulkTextChange={setBulkText}
              onTermDelimiterChange={setTermDelimiter}
              onCardDelimiterChange={setCardDelimiter}
              onCustomTermDelimiterChange={setCustomTermDelimiter}
              onCustomCardDelimiterChange={setCustomCardDelimiter}
              getDelimiterChar={getDelimiterChar}
              getCardSeparator={getCardSeparator}
            />
          )}

          {/* Error Display */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Create Deck Button */}
          <div className="flex justify-end pt-8">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-3 px-5 py-8 text-md font-semibold rounded-xl"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Deck'
              )}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Pro tip: Use clear, concise questions and detailed answers for the best study experience</p>
        </div>
      </div>
    </div>
  );
}

export default CreateDeck;