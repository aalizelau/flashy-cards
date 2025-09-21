import { useRef, useEffect, useState } from 'react';
import { Plus, Trash2, Paperclip, Eye } from 'lucide-react';
import { CustomField } from '@/shared/types/api';
import { getCustomFieldValue } from '@/shared/utils/customFields';
import PreviewCardDialog from '../../collections/components/PreviewCardDialog';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  custom_data?: { [fieldName: string]: string };
}

interface IndividualCardsSectionProps {
  flashcards: Flashcard[];
  errors: { [key: string]: string };
  languageDisplay: string;
  expandedCards: Set<string>;
  customFields?: CustomField[];
  onUpdateFlashcard: (id: string, field: 'front' | 'back', value: string) => void;
  onUpdateCustomField: (id: string, fieldName: string, value: string) => void;
  onRemoveFlashcard: (id: string) => void;
  onAddFlashcard: () => void;
  onToggleExpansion: (id: string) => void;
}

function IndividualCardsSection({
  flashcards,
  errors,
  languageDisplay,
  expandedCards,
  customFields,
  onUpdateFlashcard,
  onUpdateCustomField,
  onRemoveFlashcard,
  onAddFlashcard,
  onToggleExpansion
}: IndividualCardsSectionProps) {
  const lastCardRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCardIndex, setPreviewCardIndex] = useState(0);

  useEffect(() => {
    if (lastCardRef.current) {
      lastCardRef.current.focus();
    }
  }, [flashcards.length]);

  const handlePreviewCard = (cardIndex: number) => {
    const card = flashcards[cardIndex];
    if (!card.front && !card.back) return; // Don't preview empty cards

    setPreviewCardIndex(cardIndex);
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold text-gray-700">Flashcards</h2>
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
                {/* Right side: icons container */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreviewCard(index)}
                    disabled={!card.front && !card.back}
                    className="text-gray-400 hover:text-blue-500 p-1 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Preview flashcard"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleExpansion(card.id)}
                    className={`p-1 rounded transition-all duration-200 ${
                      expandedCards.has(card.id)
                        ? 'text-blue-600 hover:text-blue-700'
                        : 'text-gray-400 hover:text-blue-500'
                    }`}
                    aria-label="Toggle custom fields"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveFlashcard(card.id)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded transition-all duration-200"
                    aria-label="Remove flashcard"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                  Learning Word{languageDisplay ? ` (${languageDisplay})` : ''}
                </label>
                <input
                  value={card.front}
                  onChange={(e) => onUpdateFlashcard(card.id, 'front', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-accent transition-all duration-200 resize-none h-12"
                  ref={index === flashcards.length - 1 ? lastCardRef : undefined}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                  Translation 
                </label>
                <input
                  value={card.back}
                  onChange={(e) => onUpdateFlashcard(card.id, 'back', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none h-12"
                />
              </div>
            </div>

            {/* Expanded section with separator */}
            {expandedCards.has(card.id) && customFields && customFields.length > 0 && (
              <>
                {/* Separator line */}
                <div className="mx-6 border-t border-gray-200"></div>

                {/* Custom fields */}
                <div className="p-6 pt-4">
                  <div className="space-y-4">

                    {/* Render custom fields in a grid - 2 per row for up to 4, single column for 5 */}
                    <div className={`grid gap-4 ${customFields.length <= 4 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                      {customFields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">
                            {field.label}
                          </label>
                          <input
                            value={getCustomFieldValue(card.custom_data, field.name)}
                            onChange={(e) => onUpdateCustomField(card.id, field.name, e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none h-12"
                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add New Flashcard Button */}
      <div className="flex justify-center">
        <button
            type="button"
            onClick={onAddFlashcard}
            className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-500 hover:shadow transition-all duration-200 flex items-center justify-center "
            aria-label="Add new flashcard"
            >
            <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Preview Card Dialog */}
      <PreviewCardDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        cardData={{
          front: flashcards[previewCardIndex]?.front || '',
          back: flashcards[previewCardIndex]?.back || '',
        }}
      />
    </div>
  );
}

export default IndividualCardsSection;