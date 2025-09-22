import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '@/shared/services/api';
import { DeckWithCardsCreate, CardCreate, Deck, Card, CustomField } from '@/shared/types/api';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { LANGUAGES } from '@/shared/components/LanguageSelector';
import { useCustomFields } from '@/shared/hooks/useCustomFields';
import IndividualCardsSection from './IndividualCardsSection';

interface Flashcard {
  id: string;
  numericId?: number; // Original database ID for existing cards
  front: string;
  back: string;
  custom_data?: { [fieldName: string]: string };
  isNew?: boolean; // Flag to indicate if this is a new card
}

function EditDeck() {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const { userProfile } = useAuth();
  const [deckTitle, setDeckTitle] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { id: '1', front: '', back: '', isNew: true }
  ]);
  const [originalCards, setOriginalCards] = useState<Flashcard[]>([]); // Track original state for diff
  const [originalDeckTitle, setOriginalDeckTitle] = useState(''); // Track original title for diff
  const [isPublic, setIsPublic] = useState(false);
  const [originalIsPublic, setOriginalIsPublic] = useState(false); // Track original public status for diff
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Use the shared custom fields hook
  const {
    customFields,
    setCustomFields,
    addCustomField,
    removeCustomField: removeCustomFieldFromList,
    updateCustomFieldLabel,
    validateCustomFieldsState,
    cleanupCardCustomData
  } = useCustomFields();

  // Track original custom fields for comparison
  const [originalCustomFields, setOriginalCustomFields] = useState<CustomField[]>([]);

  // Helper function to get language display name
  const getLanguageDisplayName = (languageCode?: string | null): string => {
    if (!languageCode) return '';
    const language = LANGUAGES.find(lang => lang.code === languageCode);
    return language ? language.name : '';
  };

  const languageDisplay = getLanguageDisplayName(userProfile?.selected_language);

  // Load existing deck data
  useEffect(() => {
    const loadDeckData = async () => {
      if (!deckId) {
        navigate('/all-decks');
        return;
      }

      try {
        setIsLoadingData(true);
        const [deck, cards] = await Promise.all([
          apiClient.getDeckById(parseInt(deckId)),
          apiClient.getDeckCards(parseInt(deckId))
        ]);

        setDeckTitle(deck.name);
        setOriginalDeckTitle(deck.name); // Store original title for comparison
        setIsPublic(deck.is_public);
        setOriginalIsPublic(deck.is_public); // Store original public status for comparison

        // Load custom fields if they exist
        if (deck.custom_fields) {
          setCustomFields(deck.custom_fields);
          setOriginalCustomFields(deck.custom_fields);
        }

        // Convert cards to flashcard format, preserving numeric IDs
        const convertedCards: Flashcard[] = cards.map((card: Card, index: number) => ({
          id: card.id?.toString() || `existing-${index}`,
          numericId: card.id, // Preserve original database ID
          front: card.front,
          back: card.back,
          custom_data: card.custom_data,
          isNew: false, // Existing cards
        }));

        setFlashcards(convertedCards.length > 0 ? convertedCards : [{ id: '1', front: '', back: '', isNew: true }]);
        setOriginalCards(convertedCards); // Store original state for comparison
      } catch (error) {
        console.error('Failed to load deck data:', error);
        setErrors({
          submit: 'Failed to load deck data. Please try again.'
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadDeckData();
  }, [deckId, navigate]);

  const addFlashcard = () => {
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: '',
      back: '',
      custom_data: undefined,
      isNew: true // Mark as new card
    };
    setFlashcards([...flashcards, newCard]);
  };

  const removeFlashcard = (id: string) => {
    if (flashcards.length > 1) {
      setFlashcards(flashcards.filter(card => card.id !== id));
    }
  };

  const updateFlashcard = (id: string, field: 'front' | 'back', value: string) => {
    setFlashcards(flashcards.map(card =>
      card.id === id ? { ...card, [field]: value } : card
    ));
  };

  const updateCustomField = (id: string, fieldName: string, value: string) => {
    setFlashcards(flashcards.map(card => {
      if (card.id === id) {
        const customData = card.custom_data || {};
        if (value.trim()) {
          customData[fieldName] = value;
        } else {
          delete customData[fieldName];
        }
        return {
          ...card,
          custom_data: Object.keys(customData).length > 0 ? customData : undefined
        };
      }
      return card;
    }));
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

  // Handle custom field removal with data cleanup
  const removeCustomField = (index: number) => {
    const fieldToRemove = customFields[index];
    if (!fieldToRemove) return;

    // Remove field from definition
    removeCustomFieldFromList(index);

    // Clean up card data - remove this field from all cards
    if (fieldToRemove.name) {
      setFlashcards(flashcards.map(card => ({
        ...card,
        custom_data: cleanupCardCustomData(card.custom_data, fieldToRemove.name)
      })));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!deckTitle.trim()) {
      newErrors.deckTitle = 'Deck title is required';
    }

    // Validate custom fields
    if (customFields.length > 0) {
      const validation = validateCustomFieldsState();
      if (!validation.isValid) {
        if (validation.fieldIndex !== undefined) {
          newErrors[`customField_${validation.fieldIndex}`] = validation.error || 'Invalid custom field';
        } else {
          newErrors.customFields = validation.error || 'Invalid custom fields';
        }
      }
    }

    const validCards = flashcards.filter(card => card.front.trim() || card.back.trim());
    if (validCards.length === 0) {
      newErrors.flashcards = 'At least one flashcard with content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !deckId) return;

    setIsLoading(true);
    setErrors({});

    try {
      const deckIdNum = parseInt(deckId);
      
      // Filter out empty cards
      const validCards = flashcards.filter(card => card.front.trim() && card.back.trim());
      
      // Check if deck title, public status, or custom fields have changed
      const titleHasChanged = originalDeckTitle !== deckTitle.trim();
      const publicStatusHasChanged = originalIsPublic !== isPublic;
      const customFieldsHaveChanged = JSON.stringify(originalCustomFields) !== JSON.stringify(customFields);
      
      // Categorize cards by operation needed
      const cardsToDelete: Flashcard[] = [];
      const cardsToUpdate: Flashcard[] = [];
      const cardsToCreate: Flashcard[] = [];
      
      // Find cards to delete (original cards not in current flashcards)
      for (const originalCard of originalCards) {
        if (!validCards.find(card => card.id === originalCard.id)) {
          cardsToDelete.push(originalCard);
        }
      }
      
      // Categorize remaining cards
      for (const card of validCards) {
        if (card.isNew) {
          cardsToCreate.push(card);
        } else if (card.numericId) {
          // Check if card has been modified
          const originalCard = originalCards.find(orig => orig.id === card.id);
          if (originalCard) {
            const hasChanged =
              originalCard.front !== card.front ||
              originalCard.back !== card.back ||
              JSON.stringify(originalCard.custom_data || {}) !== JSON.stringify(card.custom_data || {});
            
            if (hasChanged) {
              cardsToUpdate.push(card);
            }
          }
        }
      }

      // Execute operations in sequence
      
      // 1. Delete cards first
      for (const card of cardsToDelete) {
        if (card.numericId) {
          await apiClient.deleteCard(deckIdNum, card.numericId);
        }
      }
      
      // 2. Update existing cards and/or deck metadata (PATCH) if there are any changes
      if (cardsToUpdate.length > 0 || titleHasChanged || publicStatusHasChanged || customFieldsHaveChanged) {
        const apiCards: CardCreate[] = cardsToUpdate.map(card => ({
          id: card.numericId,
          front: card.front.trim(),
          back: card.back.trim(),
          ...(card.custom_data && Object.keys(card.custom_data).length > 0 && { custom_data: card.custom_data })
        }));

        const deckData: DeckWithCardsCreate = {
          name: deckTitle.trim(),
          is_public: isPublic,
          custom_fields: customFields.filter(field => field.label.trim()).length > 0
            ? customFields.filter(field => field.label.trim())
            : undefined,
          cards: apiCards
        };

        await apiClient.patchDeckWithCards(deckIdNum, deckData);
      }
      
      // 3. Create new cards
      for (const card of cardsToCreate) {
        const cardData: CardCreate = {
          front: card.front.trim(),
          back: card.back.trim(),
          ...(card.custom_data && Object.keys(card.custom_data).length > 0 && { custom_data: card.custom_data })
        };
        
        await apiClient.addCardToDeck(deckIdNum, cardData);
      }
      
      // Navigate back to the deck detail page
      navigate(`/decks/${encodeURIComponent(deckTitle.trim())}`);
      
    } catch (error) {
      console.error('Failed to update deck:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to update deck. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-bg from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-lg">Loading deck data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className=" mb-8">
          <div className="flex items-center justify-start gap-3 mb-4 mt-10">
            <h1 className="text-4xl font-semibold font-alumni-sans text-main-foreground">EDIT DECK</h1>
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

          {/* Custom Fields Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold text-gray-700">
                Custom Fields {customFields.length > 0 && `(${customFields.length}/5)`}
              </h3>
              {customFields.length < 5 && (
                <button
                  type="button"
                  onClick={addCustomField}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Add Field
                </button>
              )}
            </div>

            {errors.customFields && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                {errors.customFields}
              </p>
            )}

            {customFields.length > 0 && (
              <div className="space-y-3">
                {customFields.map((field, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateCustomFieldLabel(index, e.target.value)}
                        placeholder="Field label (e.g., Example Sentence, Pronunciation)"
                        className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 ${
                          errors[`customField_${index}`]
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-200 focus:border-blue-500'
                        }`}
                      />
                      {errors[`customField_${index}`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`customField_${index}`]}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCustomField(index)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded transition-colors"
                      aria-label="Remove field"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {customFields.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                No custom fields. Add custom fields to store additional information for each flashcard (e.g., example sentences, pronunciation).
              </p>
            )}
          </div>

          {/* Individual Cards Section */}
          <IndividualCardsSection
            flashcards={flashcards}
            errors={errors}
            languageDisplay={languageDisplay}
            expandedCards={expandedCards}
            customFields={customFields}
            onUpdateFlashcard={updateFlashcard}
            onUpdateCustomField={updateCustomField}
            onRemoveFlashcard={removeFlashcard}
            onAddFlashcard={addFlashcard}
            onToggleExpansion={toggleCardExpansion}
          />

          {/* Error Display */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Save Changes Button */}
          <div className="flex justify-end pt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-3 px-6 py-4 bg-main-foreground text-white font-semibold font-alumni-sans rounded-xl hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 text-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
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

export default EditDeck;