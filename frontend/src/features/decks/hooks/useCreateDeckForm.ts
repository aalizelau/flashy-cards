import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { apiClient } from '@/shared/services/api';
import { DeckWithCardsCreate, CardCreate, CustomField } from '@/shared/types/api';
import { LANGUAGES } from '@/shared/components/LanguageSelector';
import { labelToFieldName, validateCustomFields } from '@/shared/utils/customFields';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  custom_data?: { [fieldName: string]: string };
}

type ImportMode = 'individual' | 'bulk';
type TermDelimiter = 'tab' | 'comma' | 'pipe' | 'semicolon' | 'custom';
type CardDelimiter = 'newline' | 'double-newline' | 'custom';

export const useCreateDeckForm = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  // Form state
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
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

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

      // Handle custom fields if they exist
      let custom_data: { [fieldName: string]: string } | undefined;
      if (customFields && customFields.length > 0 && parts.length > 2) {
        custom_data = {};
        customFields.forEach((field, fieldIndex) => {
          const fieldValue = parts[2 + fieldIndex]?.trim();
          if (fieldValue) {
            custom_data![field.name] = fieldValue;
          }
        });

        // Only include custom_data if it has values
        if (Object.keys(custom_data).length === 0) {
          custom_data = undefined;
        }
      }

      return {
        id: `bulk-${index}-${Date.now()}`,
        front,
        back,
        ...(custom_data && { custom_data }),
      };
    }).filter(card => card.front && card.back); // Only include cards with both front and back
  };

  const bulkCards = parseBulkText(bulkText);
  const hasValidFormat = bulkText.trim() && bulkCards.length > 0;

  // Flashcard management functions
  const addFlashcard = () => {
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: '',
      back: ''
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

  // Custom field management functions
  const addCustomField = () => {
    if (customFields.length < 5) {
      setCustomFields([...customFields, { name: '', label: '' }]);
    }
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomFieldLabel = (index: number, label: string) => {
    const updated = [...customFields];
    // Generate name from label using the utility function
    const name = labelToFieldName(label);
    updated[index] = { name, label };
    setCustomFields(updated);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!deckTitle.trim()) {
      newErrors.deckTitle = 'Deck title is required';
    }

    // Validate custom fields
    if (customFields.length > 0) {
      const validation = validateCustomFields(customFields);
      if (!validation.isValid) {
        newErrors.customFields = validation.error || 'Invalid custom fields';
      }

      // Check for empty labels
      for (let i = 0; i < customFields.length; i++) {
        if (!customFields[i].label.trim()) {
          newErrors[`customField_${i}`] = 'Field label cannot be empty';
        }
      }
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
        ...(card.custom_data && Object.keys(card.custom_data).length > 0 && { custom_data: card.custom_data })
      }));

      const deckData: DeckWithCardsCreate = {
        name: deckTitle.trim(),
        is_public: isPublic,
        custom_fields: customFields.filter(field => field.label.trim()).length > 0
          ? customFields.filter(field => field.label.trim()).map(field => ({ label: field.label }))
          : undefined,
        cards: apiCards
      };

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

  return {
    // State
    deckTitle,
    setDeckTitle,
    importMode,
    setImportMode,
    flashcards,
    setFlashcards,
    bulkText,
    setBulkText,
    termDelimiter,
    setTermDelimiter,
    cardDelimiter,
    setCardDelimiter,
    customTermDelimiter,
    setCustomTermDelimiter,
    customCardDelimiter,
    setCustomCardDelimiter,
    errors,
    setErrors,
    isLoading,
    expandedCards,
    setExpandedCards,
    isPublic,
    setIsPublic,
    customFields,
    setCustomFields,

    // Computed values
    languageDisplay,
    bulkCards,
    hasValidFormat,

    // Actions
    handleSubmit,
    validateForm,
    addFlashcard,
    removeFlashcard,
    updateFlashcard,
    updateCustomField,
    toggleCardExpansion,
    addCustomField,
    removeCustomField,
    updateCustomFieldLabel,
    getDelimiterChar,
    getCardSeparator
  };
};