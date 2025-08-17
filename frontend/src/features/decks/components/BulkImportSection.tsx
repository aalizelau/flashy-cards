import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

type TermDelimiter = 'tab' | 'comma' | 'pipe' | 'semicolon' | 'custom';
type CardDelimiter = 'newline' | 'double-newline' | 'custom';

interface DropdownOption {
  value: string;
  label: string;
}

interface BulkImportSectionProps {
  bulkText: string;
  termDelimiter: TermDelimiter;
  cardDelimiter: CardDelimiter;
  customTermDelimiter: string;
  customCardDelimiter: string;
  errors: { [key: string]: string };
  languageDisplay: string;
  bulkCards: Flashcard[];
  hasValidFormat: boolean;
  onBulkTextChange: (text: string) => void;
  onTermDelimiterChange: (delimiter: TermDelimiter) => void;
  onCardDelimiterChange: (delimiter: CardDelimiter) => void;
  onCustomTermDelimiterChange: (delimiter: string) => void;
  onCustomCardDelimiterChange: (delimiter: string) => void;
  getDelimiterChar: (delimiter: TermDelimiter) => string;
  getCardSeparator: (delimiter: CardDelimiter) => string;
}

function BulkImportSection({
  bulkText,
  termDelimiter,
  cardDelimiter,
  customTermDelimiter,
  customCardDelimiter,
  errors,
  languageDisplay,
  bulkCards,
  hasValidFormat,
  onBulkTextChange,
  onTermDelimiterChange,
  onCardDelimiterChange,
  onCustomTermDelimiterChange,
  onCustomCardDelimiterChange,
  getDelimiterChar,
  getCardSeparator
}: BulkImportSectionProps) {
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

  return (
    <div className="space-y-6">
      {/* Delimiter Settings */}
      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-4">Import Settings</h3>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Front/Back Separator */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Front/Back Separator</Label>
              <Select value={termDelimiter} onValueChange={(value) => onTermDelimiterChange(value as TermDelimiter)}>
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
                    onChange={(e) => onCustomTermDelimiterChange(e.target.value)}
                    className={errors.customTermDelimiter ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {errors.customTermDelimiter && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.customTermDelimiter}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Card Separator */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Card Separator</Label>
              <Select value={cardDelimiter} onValueChange={(value) => onCardDelimiterChange(value as CardDelimiter)}>
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

              {/* Custom Delimiter Input */}
              {cardDelimiter === 'custom' && (
                <div className="mt-2">
                  <Input
                    placeholder="e.g., |||, ---, etc."
                    value={customCardDelimiter}
                    onChange={(e) => onCustomCardDelimiterChange(e.target.value)}
                    className={errors.customCardDelimiter ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {errors.customCardDelimiter && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.customCardDelimiter}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Text Input */}
      <div>
        <label className="block text-md font-semibold text-gray-700 mb-2">
          Paste Your Content
        </label>
        <textarea
          value={bulkText}
          onChange={(e) => onBulkTextChange(e.target.value)}
          placeholder={`Paste your flashcard content here. Example format:\nQuestion 1${getDelimiterChar(termDelimiter)}Answer 1${getCardSeparator(cardDelimiter)}Question 2${getDelimiterChar(termDelimiter)}Answer 2`}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none ${
            errors.bulkText 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-blue-500'
          }`}
          rows={8}
        />
        {errors.bulkText && (
          <p className="mt-2 text-sm text-red-600">
            {errors.bulkText}
          </p>
        )}
      </div>

      {/* Preview */}
      {bulkText && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-gray-900">Preview</h3>
            <span className="text-sm text-gray-900 bg-muted-foreground/20 px-3 py-1 rounded-full">
              {bulkCards.length} {bulkCards.length === 1 ? 'card' : 'cards'} detected
            </span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {hasValidFormat ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {bulkCards.slice(0, 5).map((card) => (
                  <div key={card.id} >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Learning Word{languageDisplay ? ` (${languageDisplay})` : ''}
                        </label>
                        <div className="w-full h-12 px-3 bg-gray-50 border border-gray-200 rounded-md text-md text-gray-800 flex items-center">
                          {card.front}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Translation
                        </label>
                        <div className="w-full h-12 px-3 bg-gray-50 border border-gray-200 rounded-md text-md text-gray-800 flex items-center">
                          {card.back}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {bulkCards.length > 5 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    ... and {bulkCards.length - 5} more cards
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No valid flashcards detected. Check your delimiter settings and format.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkImportSection;