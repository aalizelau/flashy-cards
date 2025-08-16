import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/shared/components/ui/dropdown-menu';
import { MoreVertical, Volume2, VolumeX } from 'lucide-react';
import { Card as FlashCard } from '@/shared/types/api';
import ProgressDots from './ProgressDots';

interface FlashcardTableProps {
  cards: FlashCard[];
  playingAudio: number | null;
  onPlayAudio: (card: FlashCard) => void;
}

const FlashcardTable: React.FC<FlashcardTableProps> = ({
  cards,
  playingAudio,
  onPlayAudio,
}) => {
  const getProgressPercentage = (card: FlashCard): number =>
    Math.round(card.accuracy * 100);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-3 text-sm font-semibold text-gray-600 text-left">Word</th>
              <th className="py-3 px-3 text-sm font-semibold text-gray-600 text-left">Translation</th>
              <th className="py-3 px-3 text-sm font-semibold text-gray-600 text-left">Progress</th>
              <th className="py-3 px-3 text-sm font-semibold text-gray-600 text-left">Attempts</th>
              <th className="py-3 px-3 text-sm font-semibold text-gray-600 text-left">Last Reviewed</th>
              <th className="py-3 px-3 text-sm font-semibold text-gray-600 text-left">Date Created</th>
              <th className="py-3 px-3 text-sm font-semibold text-gray-600 text-left"></th>
            </tr>
          </thead>
        <tbody>
          {cards.map((card, idx, arr) => {
            const percentage = getProgressPercentage(card);
            const lastReviewed = card.last_reviewed_at
              ? new Date(card.last_reviewed_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '—';
            const dateCreated = card.created_at
              ? new Date(card.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '—';
            return (
              <React.Fragment key={card.id}>
                <tr>
                  <td className="py-3 px-3 align-middle max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate block">{card.front}</span>
                      {card.audio_url ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onPlayAudio(card)}
                          disabled={playingAudio === card.id}
                          aria-label={`Play audio for ${card.front}`}
                          className="h-6 w-6 flex-shrink-0"
                        >
                          {playingAudio === card.id ? (
                            <Volume2 className="w-3 h-3 text-blue-500 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3 h-3 text-muted-foreground hover:text-blue-500" />
                          )}
                        </Button>
                      ) : (
                        <VolumeX className="w-3 h-3 text-gray-300 flex-shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 align-middle max-w-[300px]">
                    <span className="text-xs text-muted-foreground truncate block">{card.back}</span>
                  </td>
                  <td className="py-3 px-3 align-middle">
                    <ProgressDots progress={percentage} />
                  </td>
                  <td className="py-3 px-3 align-middle">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                      {card.correct_answers}/{card.total_attempts}
                    </span>
                  </td>
                  <td className="py-3 px-3 align-middle">
                    <span className="text-xs text-muted-foreground">{lastReviewed}</span>
                  </td>
                  <td className="py-3 px-3 align-middle">
                    <span className="text-xs text-muted-foreground">{dateCreated}</span>
                  </td>
                  <td className="py-3 px-3 align-middle">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" aria-label="Actions">
                          <MoreVertical className="w-5 h-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
                {idx < arr.length - 1 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="border-b border-gray-200" />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlashcardTable;