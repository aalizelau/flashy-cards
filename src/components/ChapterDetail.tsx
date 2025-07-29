import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen } from 'lucide-react';
import ProgressDots from './ProgressDots';
import { Button } from '@/components/ui/button';

// You may want to pass these as props or fetch from context/store
interface Flashcard {
  id: string;
  front: string;
  back: string;
}
interface FlashcardProgress {
  id: string;
  correctAnswers: number;
  totalAttempts: number;
  lastAttempted?: Date;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered';
}

interface ChapterDetailProps {
  collectionName: string;
  flashcards: Flashcard[];
  progressData: FlashcardProgress[];
}

const ChapterDetail: React.FC<ChapterDetailProps> = ({ collectionName, flashcards, progressData }) => {
  const totalWords = flashcards.length;
  const getProgressPercentage = (progress: FlashcardProgress): number => {
    return Math.round((progress.correctAnswers / progress.totalAttempts) * 100);
  };

  if (collectionName !== 'All Words') {
    return <div className="p-8">No details for this collection.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card className="bg-gradient-card shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            All Flashcards ({totalWords})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-separate border-spacing-y-0">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-3 text-xs font-semibold text-muted-foreground">Word</th>
                      <th className="py-2 px-3 text-xs font-semibold text-muted-foreground">Translation</th>
                      <th className="py-2 px-3 text-xs font-semibold text-muted-foreground">Progress</th>
                      <th className="py-2 px-3 text-xs font-semibold text-muted-foreground">Attempts</th>
                      <th className="py-2 px-3 text-xs font-semibold text-muted-foreground">Last Reviewed</th>
                      <th className="py-2 px-3 text-xs font-semibold text-muted-foreground">Edit</th>
                      <th className="py-2 px-3 text-xs font-semibold text-muted-foreground">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flashcards
                      .slice()
                      .sort((a, b) => {
                        const progressA = progressData.find(p => p.id === a.id);
                        const progressB = progressData.find(p => p.id === b.id);
                        const percentageA = progressA ? getProgressPercentage(progressA) : 0;
                        const percentageB = progressB ? getProgressPercentage(progressB) : 0;
                        return percentageB - percentageA;
                      })
                      .map((card, idx, arr) => {
                        const progress = progressData.find(p => p.id === card.id);
                        const percentage = progress ? getProgressPercentage(progress) : 0;
                        const lastReviewed = progress?.lastAttempted
                          ? progress.lastAttempted.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                          : '—';
                        return (
                          <React.Fragment key={card.id}>
                            <tr>
                              <td className="py-3 px-3 align-middle max-w-[200px]">
                                <span className="font-medium text-sm truncate block">{card.front}</span>
                              </td>
                              <td className="py-3 px-3 align-middle max-w-[300px]">
                                <span className="text-xs text-muted-foreground truncate block">{card.back}</span>
                              </td>
                              <td className="py-3 px-3 align-middle">
                                <ProgressDots progress={percentage} />
                              </td>
                              <td className="py-3 px-3 align-middle">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800`}>
                                  {progress?.correctAnswers || 0}/{progress?.totalAttempts || 0}
                                </span>
                              </td>
                              <td className="py-3 px-3 align-middle">
                                <span className="text-xs text-muted-foreground">{lastReviewed}</span>
                              </td>
                              <td className="py-3 px-3 align-middle">
                                <Button size="icon" variant="ghost" aria-label="Edit">
                                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-muted-foreground">
                                    <path d="M14.7 3.29a1 1 0 0 1 1.41 0l.6.6a1 1 0 0 1 0 1.41l-9.1 9.1-2.12.7.7-2.12 9.1-9.1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </Button>
                              </td>
                              <td className="py-3 px-3 align-middle">
                                <Button size="icon" variant="ghost" aria-label="Delete">
                                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-destructive">
                                    <path d="M6 7v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7M4 7h12M9 3h2a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </Button>
                              </td>
                            </tr>
                            {idx < arr.length - 1 && (
                              <tr>
                                <td colSpan={7}>
                                  <div className="border-b border-border" />
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
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChapterDetail;
