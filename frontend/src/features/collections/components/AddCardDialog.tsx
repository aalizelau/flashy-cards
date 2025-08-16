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
      };

      await addCardMutation.mutateAsync({ deckId, cardData });
      
      // Reset form
      setFront('');
      setBack('');
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
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
          <DialogDescription>
            Create a new flashcard for this deck.
          </DialogDescription>
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