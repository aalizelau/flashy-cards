import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Upload, Edit3, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/shared/services/api';
import { DeckWithCardsCreate, CardCreate } from '@/shared/types/api';

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

type ImportMode = 'individual' | 'bulk';
type TermDelimiter = 'tab' | 'comma' | 'pipe' | 'semicolon' | 'custom';
type CardDelimiter = 'newline' | 'double-newline' | 'custom';

interface DropdownOption {
  value: string;
  label: string;
}

function CreateDeck() {
  const navigate = useNavigate();
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
  const lastCardRef = useRef<HTMLInputElement>(null);

  const termDelimiterOptions: DropdownOption[] = [
    { value: 'tab', label: 'Tab' },
    { value: 'comma', label: 'Comma (,)' },
    { value: 'pipe', label: 'Pipe (|)' },
    { value: 'semicolon', label: 'Semicolon (;)' },
    { value: 'custom', label: 'Custom' }
  ];

  const cardDelimiterOptions: DropdownOption[] = [
    { value: 'newline', label: 'New Line' },
    { value: 'double-newline', label: 'Double New Line' },
    { value: 'custom', label: 'Custom' }
  ];

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
      const back = parts.slice(1).join(termDelimiterChar).trim() || '';
      
      return {
        id: `bulk-${index}-${Date.now()}`,
        front,
        back
      };
    }).filter(card => card.front && card.back); // Only include cards with both front and back
  };

  const bulkCards = parseBulkText(bulkText);
  const hasValidFormat = bulkText.trim() && bulkCards.length > 0;

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
        back: card.back.trim()
      }));

      const deckData: DeckWithCardsCreate = {
        name: deckTitle.trim(),
        cards: apiCards
      };

      const response = await apiClient.createDeckWithCards(deckData);
      
      // Navigate to the newly created deck detail page
      navigate(`/chapter/${encodeURIComponent(response.name)}`);
      
    } catch (error) {
      console.error('Failed to create deck:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create deck. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (lastCardRef.current && importMode === 'individual') {
      lastCardRef.current.focus();
    }
  }, [flashcards.length, importMode]);

  return (
    <div className="min-h-screen bg-gradient-bg from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className=" mb-8">
          <div className="flex items-center justify-start gap-3 mb-4 mt-10">
            {/* <BookOpen className="w-8 h-8 text-test-chapters-foreground" /> */}
            <h1 className="text-4xl font-semibold font-alumni-sans text-main-foreground">CREATE A NEW DECK</h1>
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

          {/* Import Mode Toggle */}
          <div >
            <h2 className="text-md font-semibold text-gray-900 mb-4">Choose Import Method</h2>
            <div className="bg-white/80 rounded-xl border border-gray-200 p-6">
                <div className="flex gap-4">
                    <button
                    type="button"
                    onClick={() => setImportMode('individual')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                        importMode === 'individual'
                        ? 'border-accent bg-sharp-blue/10 '
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    >
                    <Edit3 className="w-4 h-4" />
                    Individual Cards
                    </button>

                    <button
                    type="button"
                    onClick={() => setImportMode('bulk')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                        importMode === 'bulk'
                        ? 'border-muted-foreground/80 bg-muted-foreground/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    >
                    <Upload className="w-4 h-4" />
                    Bulk Import
                    </button>
                </div>
                </div>

          </div>

          {/* Individual Cards Mode */}
          {importMode === 'individual' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-md font-semibold text-gray-900">Flashcards</h2>
                <span className="text-sm text-gray-900 bg-muted-foreground/20 px-3 py-1 rounded-full ">
                  {flashcards.length} {flashcards.length === 1 ? 'card' : 'cards'}
                </span>
              </div>

              {errors.flashcards && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {errors.flashcards}
                </p>
              )}

              <div className="grid gap-6">
                {flashcards.map((card, index) => (
                  <div 
                    key={card.id} 
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="bg-gray-100/90 px-6 py-2 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-gray-700 font-medium text-sm">
                            {index + 1}
                        </h3>
                        {flashcards.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFlashcard(card.id)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded transition-all duration-200"
                            aria-label="Remove flashcard"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Front 
                        </label>
                        <input
                          value={card.front}
                          onChange={(e) => updateFlashcard(card.id, 'front', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-accent transition-all duration-200 resize-none h-14"
                        //   rows={2}
                          ref={index === flashcards.length - 1 ? lastCardRef : undefined}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Back 
                        </label>
                        <input
                          value={card.back}
                          onChange={(e) => updateFlashcard(card.id, 'back', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none h-14"
                        //   rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Flashcard Button */}
              <div className="flex justify-center">
                <button
                    type="button"
                    onClick={addFlashcard}
                    className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-500 hover:shadow transition-all duration-200 flex items-center justify-center "
                    aria-label="Add new flashcard"
                    >
                    <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {/* Bulk Import Mode */}
          {importMode === 'bulk' && (
            <div className="space-y-6">
              
              {/* Delimiter Settings */}
                <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">Import Settings</h3>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="grid md:grid-cols-2 gap-6">

                    {/* Front/Back Separator */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Front/Back Separator</Label>
                        <Select value={termDelimiter} onValueChange={(value) => setTermDelimiter(value as TermDelimiter)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select separator" />
                        </SelectTrigger>
                        <SelectContent>
                            {termDelimiterOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>

                        {/* Custom Term Delimiter Input */}
                        {termDelimiter === 'custom' && (
                        <div className="mt-2">
                          <Input
                              placeholder="e.g., ::, =>, etc."
                              value={customTermDelimiter}
                              onChange={(e) => setCustomTermDelimiter(e.target.value)}
                              className={errors.customTermDelimiter ? 'border-red-300 focus:border-red-500' : ''}
                          />
                          {errors.customTermDelimiter && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.customTermDelimiter}
                            </p>
                          )}
                        </div>
                        )}
                    </div>

                    {/* Card Separator */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Card Separator</Label>
                        <Select value={cardDelimiter} onValueChange={(value) => setCardDelimiter(value as CardDelimiter)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select card separator" />
                        </SelectTrigger>
                        <SelectContent>
                            {cardDelimiterOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>

                        {/* Custom Delimiter Input */}
                        {cardDelimiter === 'custom' && (
                        <div className="mt-2">
                          <Input
                              placeholder="e.g., |||, ---, etc."
                              value={customCardDelimiter}
                              onChange={(e) => setCustomCardDelimiter(e.target.value)}
                              className={errors.customCardDelimiter ? 'border-red-300 focus:border-red-500' : ''}
                          />
                          {errors.customCardDelimiter && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.customCardDelimiter}
                            </p>
                          )}
                        </div>
                        )}
                    </div>
                    
                    </div>
                </div>
                </div>


              {/* Bulk Text Input */}
              <div>
                <label className="block text-md font-semibold text-gray-700 mb-2">
                  Paste Your Content
                </label>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`Paste your flashcard content here. Example format:\nQuestion 1${getDelimiterChar(termDelimiter)}Answer 1${getCardSeparator(cardDelimiter)}Question 2${getDelimiterChar(termDelimiter)}Answer 2`}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none ${
                    errors.bulkText 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                  rows={8}
                />
                {errors.bulkText && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.bulkText}
                  </p>
                )}
              </div>

              {/* Preview */}
              {bulkText && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-md font-semibold text-gray-900">Preview</h3>
                        <span className="text-sm text-gray-900 bg-muted-foreground/20 px-3 py-1 rounded-full">
                            {bulkCards.length} {bulkCards.length === 1 ? 'card' : 'cards'} detected
                        </span>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                    {hasValidFormat ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                        {bulkCards.slice(0, 5).map((card) => (
                            <div key={card.id} >
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Front
                                </label>
                                <div className="w-full h-12 px-3 bg-gray-50 border border-gray-200 rounded-md text-md text-gray-800 flex items-center">
                                    {card.front}
                                </div>
                                </div>
                                <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Back
                                </label>
                                <div className="w-full h-12 px-3 bg-gray-50 border border-gray-200 rounded-md text-md text-gray-800 flex items-center">
                                    {card.back}
                                </div>
                                </div>
                            </div>
                            </div>
                        ))}

                        {bulkCards.length > 5 && (
                            <p className="text-sm text-gray-500 text-center py-2">
                            ... and {bulkCards.length - 5} more cards
                            </p>
                        )}
                        </div>

                    ) : (
                        <p className="text-gray-500 text-center py-4">
                        No valid flashcards detected. Check your delimiter settings and format.
                        </p>
                    )}
                    </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Create Deck Button */}
          <div className="flex justify-end pt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-3 px-6 py-4 bg-main-foreground text-white font-semibold font-alumni-sans rounded-xl hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 text-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Deck'
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

export default CreateDeck;