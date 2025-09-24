import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Paperclip } from 'lucide-react';
import { useUpdateCard } from '@/shared/hooks/useApi';
import { CardCreate, Card, CustomField } from '@/shared/types/api';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { LANGUAGES } from '@/shared/components/LanguageSelector';
import { getCustomFieldValue, setCustomFieldValue } from '@/shared/utils/customFields';

interface EditCardDialogProps {
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  customFields?: CustomField[];
}

const EditCardDialog: React.FC<EditCardDialogProps> = ({
  card,
  open,
  onOpenChange,
  onSuccess,
  customFields,
}) => {
  const { userProfile } = useAuth();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [exampleSentence1, setExampleSentence1] = useState('');
  const [sentenceTranslation1, setSentenceTranslation1] = useState('');
  const [exampleSentence2, setExampleSentence2] = useState('');
  const [sentenceTranslation2, setSentenceTranslation2] = useState('');
  const [expandedView, setExpandedView] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<{ [fieldName: string]: string }>({});
  const [errors, setErrors] = useState<{ front?: string; back?: string; submit?: string }>({});

  const updateCardMutation = useUpdateCard();

  // Helper function to get language display name
  const getLanguageDisplayName = (languageCode?: string | null): string => {
    if (!languageCode) return '';
    const language = LANGUAGES.find(lang => lang.code === languageCode);
    return language ? language.name : '';
  };

  const languageDisplay = getLanguageDisplayName(userProfile?.selected_language);

  // Populate form when card changes
  useEffect(() => {
    if (card && open) {
      setFront(card.front);
      setBack(card.back);
      setExampleSentence1(card.example_sentence_1 || '');
      setSentenceTranslation1(card.sentence_translation_1 || '');
      setExampleSentence2(card.example_sentence_2 || '');
      setSentenceTranslation2(card.sentence_translation_2 || '');

      // Initialize custom field values
      const initialCustomValues: { [fieldName: string]: string } = {};
      customFields?.forEach(field => {
        initialCustomValues[field.name] = getCustomFieldValue(card.custom_data, field.name);
      });
      setCustomFieldValues(initialCustomValues);

      // Auto-expand if any sentence fields or custom fields have content
      const hasCustomContent = Object.values(initialCustomValues).some(value => value.trim());
      setExpandedView(!!(card.example_sentence_1 || card.sentence_translation_1 || card.example_sentence_2 || card.sentence_translation_2 || hasCustomContent));
      setErrors({});
    }
  }, [card, open, customFields]);

  const handleCustomFieldChange = (fieldName: string, value: string) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!card) return;
    
    // Validate form
    const newErrors: { front?: string; back?: string; submit?: string } = {};
    
    if (!front.trim()) {
      newErrors.front = 'Front text is required';
    }
    
    if (!back.trim()) {
      newErrors.back = 'Back text is required';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      // Build custom_data object from custom field values
      let customData: { [fieldName: string]: string } = {};
      customFields?.forEach(field => {
        const value = customFieldValues[field.name];
        if (value && value.trim()) {
          customData[field.name] = value.trim();
        }
      });

      // Only include custom_data if it has any values
      const hasCustomData = Object.keys(customData).length > 0;

      const cardData: CardCreate = {
        front: front.trim(),
        back: back.trim(),
        ...(exampleSentence1.trim() && { example_sentence_1: exampleSentence1.trim() }),
        ...(sentenceTranslation1.trim() && { sentence_translation_1: sentenceTranslation1.trim() }),
        ...(exampleSentence2.trim() && { example_sentence_2: exampleSentence2.trim() }),
        ...(sentenceTranslation2.trim() && { sentence_translation_2: sentenceTranslation2.trim() }),
        ...(hasCustomData && { custom_data: customData }),
      };

      await updateCardMutation.mutateAsync({ deckId: card.deck_id, cardId: card.id, cardData });
      
      // Close dialog
      onOpenChange(false);
      
      // Call success callback
      onSuccess?.();
      
    } catch (error) {
      console.error('Failed to update card:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to update card. Please try again.'
      });
    }
  };

  const handleClose = () => {
    if (!updateCardMutation.isPending) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-alumni-sans text-3xl text-main-foreground">Edit Card</DialogTitle>
            <button
              type="button"
              onClick={() => setExpandedView(!expandedView)}
              className={`p-2 rounded transition-all duration-200 ${
                expandedView 
                  ? 'text-blue-600 hover:text-blue-700' 
                  : 'text-gray-400 hover:text-blue-500'
              }`}
              aria-label="Toggle example sentence fields"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="front">Learning Word{languageDisplay ? ` (${languageDisplay})` : ''}</Label>
            <Input
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Enter the word you try to learn..."
              className={errors.front ? 'border-red-300 focus:border-red-500' : ''}
              disabled={updateCardMutation.isPending}
            />
            {errors.front && (
              <p className="text-sm text-red-600">{errors.front}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="back">Translation</Label>
            <Input
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Enter the translation in your language..."
              className={errors.back ? 'border-red-300 focus:border-red-500' : ''}
              disabled={updateCardMutation.isPending}
            />
            {errors.back && (
              <p className="text-sm text-red-600">{errors.back}</p>
            )}
          </div>

          {/* Expanded section with sentence fields */}
          {expandedView && (
            <>
              {/* Separator line */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Example sentence fields */}
              <div className="space-y-4">
                {/* Sentence 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="example_sentence_1">
                      Sentence 1{languageDisplay ? ` (${languageDisplay})` : ''}
                    </Label>
                    <Input
                      id="example_sentence_1"
                      value={exampleSentence1}
                      onChange={(e) => setExampleSentence1(e.target.value)}
                      disabled={updateCardMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sentence_translation_1">Translation 1</Label>
                    <Input
                      id="sentence_translation_1"
                      value={sentenceTranslation1}
                      onChange={(e) => setSentenceTranslation1(e.target.value)}
                      disabled={updateCardMutation.isPending}
                    />
                  </div>
                </div>

                {/* Sentence 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="example_sentence_2">
                      Sentence 2{languageDisplay ? ` (${languageDisplay})` : ''}
                    </Label>
                    <Input
                      id="example_sentence_2"
                      value={exampleSentence2}
                      onChange={(e) => setExampleSentence2(e.target.value)}
                      disabled={updateCardMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sentence_translation_2">Translation 2</Label>
                    <Input
                      id="sentence_translation_2"
                      value={sentenceTranslation2}
                      onChange={(e) => setSentenceTranslation2(e.target.value)}
                      disabled={updateCardMutation.isPending}
                    />
                  </div>
                </div>

                {/* Custom Fields */}
                {customFields && customFields.length > 0 && (
                  <>
                    {/* Separator line for custom fields */}
                    <div className="border-t border-gray-200 my-4"></div>

                    {/* Custom fields grid - 2 columns for ≤4 fields, 1 column for 5 fields */}
                    <div className={`grid gap-4 ${customFields.length <= 4 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                      {customFields.map((field) => (
                        <div key={field.name} className="space-y-2">
                          <Label htmlFor={`custom_${field.name}`}>
                            {field.label}
                          </Label>
                          <Input
                            id={`custom_${field.name}`}
                            value={customFieldValues[field.name] || ''}
                            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                            disabled={updateCardMutation.isPending}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateCardMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateCardMutation.isPending}
            >
              {updateCardMutation.isPending ? 'Updating...' : 'Update Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCardDialog;