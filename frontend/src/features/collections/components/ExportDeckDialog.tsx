import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Copy, Check } from 'lucide-react';
import { Card } from '@/shared/types/api';
import { useToast } from '@/shared/hooks/use-toast';

// Reuse the same types as import functionality
type TermDelimiter = 'tab' | 'comma' | 'pipe' | 'semicolon' | 'custom';
type CardDelimiter = 'newline' | 'double-newline' | 'custom';

interface DropdownOption {
  value: string;
  label: string;
}

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
  
  // Delimiter state
  const [termDelimiter, setTermDelimiter] = useState<TermDelimiter>('tab');
  const [cardDelimiter, setCardDelimiter] = useState<CardDelimiter>('newline');
  const [customTermDelimiter, setCustomTermDelimiter] = useState('');
  const [customCardDelimiter, setCustomCardDelimiter] = useState('');
  
  // Export options
  const [options, setOptions] = useState<ExportOptions>({
    includeFront: true,
    includeBack: true,
    includeExample1: true,
    includeExample2: true,
  });

  // Delimiter conversion functions (same as import)
  const getDelimiterChar = (delimiter: TermDelimiter): string => {
    switch (delimiter) {
      case 'tab': return '\t';
      case 'comma': return ',';
      case 'pipe': return '|';
      case 'semicolon': return ';';
      case 'custom': return customTermDelimiter || '\t';
      default: return '\t';
    }
  };

  const getCardSeparator = (delimiter: CardDelimiter): string => {
    switch (delimiter) {
      case 'newline': return '\n';
      case 'double-newline': return '\n\n';
      case 'custom': return customCardDelimiter || '\n';
      default: return '\n';
    }
  };

  // Delimiter options (same as import)
  const termDelimiterOptions: DropdownOption[] = [
    { value: 'tab', label: 'Tab' },
    { value: 'comma', label: 'Comma (,)' },
    { value: 'pipe', label: 'Pipe (|)' },
    { value: 'semicolon', label: 'Semicolon (;)' },
    { value: 'custom', label: 'Custom' }
  ];

  const cardDelimiterOptions: DropdownOption[] = [
    { value: 'newline', label: 'New Line' },
    { value: 'double-newline', label: 'Double New Line' },
    { value: 'custom', label: 'Custom' }
  ];

  const exportText = useMemo(() => {
    if (!cards || cards.length === 0) return '';

    const fieldDelimiter = getDelimiterChar(termDelimiter);
    const cardSeparator = getCardSeparator(cardDelimiter);

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
      
      return fields.join(fieldDelimiter);
    }).join(cardSeparator);
  }, [cards, options, termDelimiter, cardDelimiter, customTermDelimiter, customCardDelimiter]);

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
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-3xl font-alumni-sans text-main-foreground">
            Export Deck
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-y-auto">
          {/* Field Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Include Fields</h3>
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
          </div>

          {/* Export Settings */}
          <div>
            {/* <h3 className="text-md font-semibold text-gray-900 mb-4">Export Settings</h3> */}
            {/* <div className="bg-white rounded-xl border border-gray-200 p-6"> */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Field Delimiter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Field Separator</Label>
                  <Select value={termDelimiter} onValueChange={(value) => setTermDelimiter(value as TermDelimiter)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select separator" />
                    </SelectTrigger>
                    <SelectContent>
                      {termDelimiterOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Custom Term Delimiter Input */}
                  {termDelimiter === 'custom' && (
                    <div className="mt-2">
                      <Input
                        placeholder="e.g., ::, =>, etc."
                        value={customTermDelimiter}
                        onChange={(e) => setCustomTermDelimiter(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Card Delimiter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Card Separator</Label>
                  <Select value={cardDelimiter} onValueChange={(value) => setCardDelimiter(value as CardDelimiter)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select card separator" />
                    </SelectTrigger>
                    <SelectContent>
                      {cardDelimiterOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Custom Card Delimiter Input */}
                  {cardDelimiter === 'custom' && (
                    <div className="mt-2">
                      <Input
                        placeholder="e.g., |||, ---, etc."
                        value={customCardDelimiter}
                        onChange={(e) => setCustomCardDelimiter(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            {/* </div> */}
          </div>

          {/* Export Preview */}
          <div>
            <Label htmlFor="export-text" className="text-sm font-medium">
              Export Preview ({cards.length} cards)
            </Label>
            <Textarea
              id="export-text"
              value={exportText}
              readOnly
              className="mt-2 h-64 font-mono text-sm resize-none"
              placeholder="Configure options above to generate export text..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
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