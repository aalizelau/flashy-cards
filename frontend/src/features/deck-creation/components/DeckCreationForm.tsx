import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useToast } from '@/shared/hooks/use-toast';

const flashcardSchema = z.object({
  front: z.string().min(1, 'Front side is required'),
  back: z.string().min(1, 'Back side is required'),
});

const deckSchema = z.object({
  title: z.string().min(1, 'Deck title is required'),
  description: z.string().optional(),
  flashcards: z.array(flashcardSchema).min(1, 'At least one flashcard is required'),
});

type DeckFormData = z.infer<typeof deckSchema>;

export default function DeckCreationForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DeckFormData>({
    resolver: zodResolver(deckSchema),
    defaultValues: {
      title: '',
      description: '',
      flashcards: [{ front: '', back: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'flashcards',
  });

  const addFlashcard = () => {
    append({ front: '', back: '' });
  };

  const removeFlashcard = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: DeckFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to create deck
      console.log('Creating deck:', data);
      
      toast({
        title: 'Deck created successfully!',
        description: `${data.title} with ${data.flashcards.length} flashcards has been created.`,
      });
      
      // Navigate back to dashboard or deck list
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error creating deck',
        description: 'There was an error creating your deck. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Create New Deck</h1>
        <p className="text-muted-foreground">
          Create a new flashcard deck to start learning. Add as many cards as you need.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Deck Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl">Deck Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deck Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter deck title..." 
                        className="bg-background"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your deck..." 
                        className="bg-background resize-none"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Flashcards */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Flashcards</CardTitle>
              <Button
                type="button"
                onClick={addFlashcard}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Flashcard
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border border-border bg-card/50">
                    <div className="absolute top-2 right-2">
                      <Button
                        type="button"
                        onClick={() => removeFlashcard(index)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`flashcards.${index}.front`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Front Side *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter the question or prompt..." 
                              className="bg-background resize-none"
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`flashcards.${index}.back`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Back Side *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter the answer or explanation..." 
                              className="bg-background resize-none"
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="text-center mt-2">
                    <span className="text-sm text-muted-foreground">
                      Card {index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="gap-2"
            >
              Cancel
            </Button>
            
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={addFlashcard}
                variant="secondary"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Card
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 min-w-[140px]"
              >
                {isSubmitting ? 'Creating...' : 'Create Deck'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}