import React, { useState } from 'react';
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
import { useAddCardToDeck } from '@/shared/hooks/useApi';
import { CardCreate } from '@/shared/types/api';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { LANGUAGES } from '@/shared/components/LanguageSelector';

interface AddCardDialogProps {
  deckId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AddCardDialog: React.FC<AddCardDialogProps> = ({
  deckId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { userProfile } = useAuth();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [exampleSentence1, setExampleSentence1] = useState('');
  const [sentenceTranslation1, setSentenceTranslation1] = useState('');
  const [exampleSentence2, setExampleSentence2] = useState('');
  const [sentenceTranslation2, setSentenceTranslation2] = useState('');
  const [expandedView, setExpandedView] = useState(false);
  const [errors, setErrors] = useState<{ front?: string; back?: string; submit?: string }>({});

  const addCardMutation = useAddCardToDeck();

  // Helper function to get language display name
  const getLanguageDisplayName = (languageCode?: string | null): string => {
    if (!languageCode) return '';
    const language = LANGUAGES.find(lang => lang.code === languageCode);
    return language ? language.name : '';
  };

  const languageDisplay = getLanguageDisplayName(userProfile?.selected_language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const cardData: CardCreate = {
        front: front.trim(),
        back: back.trim(),
        ...(exampleSentence1.trim() && { example_sentence_1: exampleSentence1.trim() }),
        ...(sentenceTranslation1.trim() && { sentence_translation_1: sentenceTranslation1.trim() }),
        ...(exampleSentence2.trim() && { example_sentence_2: exampleSentence2.trim() }),
        ...(sentenceTranslation2.trim() && { sentence_translation_2: sentenceTranslation2.trim() }),
      };

      await addCardMutation.mutateAsync({ deckId, cardData });
      
      // Reset form
      setFront('');
      setBack('');
      setExampleSentence1('');
      setSentenceTranslation1('');
      setExampleSentence2('');
      setSentenceTranslation2('');
      setExpandedView(false);
      setErrors({});
      
      // Close dialog
      onOpenChange(false);
      
      // Call success callback
      onSuccess?.();
      
    } catch (error) {
      console.error('Failed to add card:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to add card. Please try again.'
      });
    }
  };

  const handleClose = () => {
    if (!addCardMutation.isPending) {
      setFront('');
      setBack('');
      setExampleSentence1('');
      setSentenceTranslation1('');
      setExampleSentence2('');
      setSentenceTranslation2('');
      setExpandedView(false);
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-alumni-sans text-3xl text-main-foreground">Add New Card</DialogTitle>
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
              disabled={addCardMutation.isPending}
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
              disabled={addCardMutation.isPending}
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
                      placeholder="Enter example sentence..."
                      disabled={addCardMutation.isPending}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sentence_translation_1">Translation 1</Label>
                    <Input
                      id="sentence_translation_1"
                      value={sentenceTranslation1}
                      onChange={(e) => setSentenceTranslation1(e.target.value)}
                      placeholder="Enter sentence translation..."
                      disabled={addCardMutation.isPending}
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
                      placeholder="Enter example sentence..."
                      disabled={addCardMutation.isPending}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sentence_translation_2">Translation 2</Label>
                    <Input
                      id="sentence_translation_2"
                      value={sentenceTranslation2}
                      onChange={(e) => setSentenceTranslation2(e.target.value)}
                      placeholder="Enter sentence translation..."
                      disabled={addCardMutation.isPending}
                    />
                  </div>
                </div>
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
              disabled={addCardMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addCardMutation.isPending}
            >
              {addCardMutation.isPending ? 'Adding...' : 'Add Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCardDialog;