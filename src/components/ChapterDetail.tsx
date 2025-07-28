import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Flashcard } from './FlashcardApp';
import { Chapter } from './ListView';
import ProgressDots from './ProgressDots';

interface ChapterDetailProps {
  chapter: Chapter;
  flashcards: Flashcard[];
  onBack: () => void;
  onStartTest: () => void;
}

export const ChapterDetail: React.FC<ChapterDetailProps> = ({
  chapter,
  flashcards,
  onBack,
  onStartTest
}) => {
  const chapterFlashcards = flashcards.filter(card => 
    chapter.flashcardIds.includes(card.id)
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{chapter.title}</h1>
            <p className="text-muted-foreground mt-1">{chapter.description}</p>
          </div>
          <Button onClick={onStartTest}>
            Start Test
          </Button>
        </div>

        <div className="bg-card rounded-lg p-6 mb-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Chapter Progress</h2>
              <p className="text-sm text-muted-foreground">
                {chapter.wordCount} words • {chapter.progress}% learned
              </p>
            </div>
            <ProgressDots progress={chapter.progress} totalDots={10} />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Flashcards in this chapter</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapterFlashcards.map((flashcard) => (
              <Card key={flashcard.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-2">{flashcard.front}</h3>
                      <p className="text-muted-foreground">{flashcard.back}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};