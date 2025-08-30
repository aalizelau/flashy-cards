import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Copy, Check } from 'lucide-react';
import { Card } from '@/shared/types/api';
import { useToast } from '@/shared/hooks/use-toast';

interface ExportDeckDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  deckName: string;
}

interface ExportOptions {
  includeFront: boolean;
  includeBack: boolean;
  includeExample1: boolean;
  includeExample2: boolean;
}

const ExportDeckDialog: React.FC<ExportDeckDialogProps> = ({
  isOpen,
  onClose,
  cards,
  deckName,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    includeFront: true,
    includeBack: true,
    includeExample1: true,
    includeExample2: true,
  });

  const exportText = useMemo(() => {
    if (!cards || cards.length === 0) return '';

    return cards.map(card => {
      const fields = [];
      
      if (options.includeFront) fields.push(card.front || '');
      if (options.includeBack) fields.push(card.back || '');
      if (options.includeExample1) {
        fields.push(card.example_sentence_1 || '');
        fields.push(card.sentence_translation_1 || '');
      }
      if (options.includeExample2) {
        fields.push(card.example_sentence_2 || '');
        fields.push(card.sentence_translation_2 || '');
      }
      
      return fields.join('\t');
    }).join('\n');
  }, [cards, options]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: `${cards.length} cards exported successfully`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = exportText;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast({
          title: "Copied to clipboard",
          description: `${cards.length} cards exported successfully`,
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        toast({
          title: "Copy failed",
          description: "Please select the text and copy manually",
          variant: "destructive",
        });
      }
      document.body.removeChild(textArea);
    }
  };

  const handleOptionChange = (option: keyof ExportOptions) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-alumni-sans text-main-foreground">
            Export Deck
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Export Options */}
          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="front"
                checked={options.includeFront}
                onCheckedChange={() => handleOptionChange('includeFront')}
              />
              <Label htmlFor="front">Word/Term</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="back"
                checked={options.includeBack}
                onCheckedChange={() => handleOptionChange('includeBack')}
              />
              <Label htmlFor="back">Translation/Definition</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="example1"
                checked={options.includeExample1}
                onCheckedChange={() => handleOptionChange('includeExample1')}
              />
              <Label htmlFor="example1">Example Sentences 1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="example2"
                checked={options.includeExample2}
                onCheckedChange={() => handleOptionChange('includeExample2')}
              />
              <Label htmlFor="example2">Example Sentences 2</Label>
            </div>
          </div>

          {/* Preview Text */}
          <div>
            <Label htmlFor="export-text" className="text-sm font-medium">
              Export Preview ({cards.length} cards)
            </Label>
            <Textarea
              id="export-text"
              value={exportText}
              readOnly
              className="mt-2 h-64 font-mono text-sm resize-none"
              placeholder="Select options above to generate export text..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCopy}
            disabled={!exportText.trim()}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy to Clipboard
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDeckDialog;