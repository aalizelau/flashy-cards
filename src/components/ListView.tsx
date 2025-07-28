import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressDots from './ProgressDots';

export interface Chapter {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  wordCount: number;
  progress: number; // 0-100
  flashcardIds: string[];
}

interface ListViewProps {
  chapters: Chapter[];
  onChapterClick: (chapter: Chapter) => void;
  onStartTest: () => void;
  onViewReview: () => void;
}

export const ListView: React.FC<ListViewProps> = ({ 
  chapters, 
  onChapterClick, 
  onStartTest, 
  onViewReview 
}) => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Flashcard Collections</h1>
            <p className="text-muted-foreground mt-2">Choose a chapter to start learning</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onViewReview}>
              View Review
            </Button>
            <Button onClick={onStartTest}>
              Start Test
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {chapters.map((chapter) => (
            <Card 
              key={chapter.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-card border-border"
              onClick={() => onChapterClick(chapter)}
            >
              <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
                <img 
                  src={chapter.coverImage} 
                  alt={chapter.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-semibold text-lg mb-1">{chapter.title}</h3>
                  <p className="text-white/80 text-sm">{chapter.description}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground">
                    {chapter.wordCount} words
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {chapter.progress}% learned
                  </span>
                </div>
                <ProgressDots progress={chapter.progress} totalDots={5} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};