import React, { useState } from 'react';
import { User, Bookmark, Clock, BookOpen, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/services/api';
import { PublicDeck } from '@/shared/types/api';

interface CommunityCardProps {
  deck: PublicDeck;
  onClick: () => void;
  onDeckCopied?: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ deck, onClick, onDeckCopied }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const queryClient = useQueryClient();

  // Copy deck mutation
  const copyDeckMutation = useMutation({
    mutationFn: (deckId: number) => apiClient.copyPublicDeck(deckId),
    onSuccess: (newDeck) => {
      // Invalidate user's decks to refresh the list
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      // Close popup
      setIsPopupOpen(false);
      // Call parent callback if provided
      if (onDeckCopied) {
        onDeckCopied();
      }
    },
    onError: (error) => {
      console.error('Failed to copy deck:', error);
      // TODO: Show error toast - for now just close popup
      setIsPopupOpen(false);
    },
  });

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsPopupOpen(true);
  };

  const handleConfirmCopy = () => {
    copyDeckMutation.mutate(deck.id);
  };
  return (
    <>
      <Card
      className="cursor-pointer hover:scale-105 transition-transform shadow-card rounded-xl"
      onClick={onClick}
    >
      <CardHeader className="pb-1">
        <CardTitle className="flex justify-between items-center">
          <span className="text-lg font-medium font-Koh-Santepheap truncate">{deck.name}</span>

          <Bookmark
            className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            onClick={handleBookmarkClick}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-8">
          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 flex items-center space-x-1 w-fit">
            <BookOpen className="h-3 w-3" />
            <span>{deck.card_count} cards</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-muted-foreground text-sm">
              {deck.author_name}
            </span>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-muted-foreground text-sm">
              {deck.last_modified
                ? new Date(deck.last_modified).toLocaleDateString()
                : new Date(deck.created_at).toLocaleDateString()
              }
            </span>
          </div>
        </div>
      </CardContent>
      </Card>

      <AlertDialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <AlertDialogContent className="max-w-sm ">
          <AlertDialogHeader className="mb-4">
            <AlertDialogTitle className="font-alumni-sans text-3xl text-main-foreground">Save Deck</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a copy you can study and modify.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCopy}
              disabled={copyDeckMutation.isPending}
              className="bg-muted-foreground text-white hover:bg-main-foreground flex-1"
            >
              {copyDeckMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save to Collection'
              )}
            </AlertDialogAction>
          </AlertDialogFooter >
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CommunityCard;