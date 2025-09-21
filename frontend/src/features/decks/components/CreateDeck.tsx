import { Loader2, Zap, Info, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import ImportModeToggle from './ImportModeToggle';
import IndividualCardsSection from './IndividualCardsSection';
import BulkImportSection from './BulkImportSection';
import { useCreateDeckForm } from '../hooks/useCreateDeckForm';


function CreateDeck() {
  const {
    // State
    deckTitle,
    setDeckTitle,
    importMode,
    setImportMode,
    flashcards,
    bulkText,
    setBulkText,
    termDelimiter,
    setTermDelimiter,
    cardDelimiter,
    setCardDelimiter,
    customTermDelimiter,
    setCustomTermDelimiter,
    customCardDelimiter,
    setCustomCardDelimiter,
    errors,
    isLoading,
    expandedCards,
    isPublic,
    setIsPublic,
    customFields,

    // Computed values
    languageDisplay,
    bulkCards,
    hasValidFormat,

    // Actions
    handleSubmit,
    addFlashcard,
    removeFlashcard,
    updateFlashcard,
    updateCustomField,
    toggleCardExpansion,
    addCustomField,
    removeCustomField,
    updateCustomFieldLabel,
    getDelimiterChar,
    getCardSeparator
  } = useCreateDeckForm();


  return (
    <div className="min-h-screen bg-gradient-bg from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className=" mb-8">
          <div className="flex items-center justify-between gap-3 mb-4 mt-10">
            <h1 className="text-4xl font-semibold font-alumni-sans text-main-foreground">CREATE A NEW DECK</h1>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-md font-regular h-12"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Create
                </>
              )}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={`space-y-8 ${isLoading ? 'pointer-events-none opacity-70' : ''}`}>
          {/* Deck Title */}
          <div>
            <label htmlFor="deckTitle" className="block text-md font-semibold text-gray-700 mb-3">
              Deck Title
            </label>
            <Input
              type="text"
              id="deckTitle"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              placeholder="e.g., Food Vocabulary, Travel Phrases, Common Greetings"
            />
            {errors.deckTitle && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                {errors.deckTitle}
              </p>
            )}
          </div>

          {/* Public Deck Toggle */}
          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-3">
              Set as public
            </h3>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic
                    ? 'bg-muted-foreground'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <label className="text-sm text-gray-600 cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
                Allow other users to discover and use this deck
              </label>
            </div>
          </div>

          {/* Custom Fields Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-md font-semibold text-gray-700">
                Custom Fields
              </h3>
              <div className="relative group">
                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10">
                  Add optional fields for your flashcards, like example sentences, conjugation, or notes.
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>

            {customFields.map((field, index) => (
              <div key={index} className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateCustomFieldLabel(index, e.target.value)}
                    placeholder={`Field ${index + 1}`}
                  />
                  {errors[`customField_${index}`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`customField_${index}`]}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeCustomField(index)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                  title="Remove field"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {customFields.length < 5 && (
              <button
                type="button"
                onClick={addCustomField}
                className="text-muted-foreground hover:text-blue-800 text-sm font-medium"
              >
                + New Field
              </button>
            )}

            {errors.customFields && (
              <p className="mt-2 text-sm text-red-600">{errors.customFields}</p>
            )}
          </div>

          {/* Import Mode Toggle */}
          <ImportModeToggle
            importMode={importMode}
            onModeChange={setImportMode}
          />

          {/* Individual Cards Mode */}
          {importMode === 'individual' && (
            <IndividualCardsSection
              flashcards={flashcards}
              errors={errors}
              languageDisplay={languageDisplay}
              expandedCards={expandedCards}
              customFields={customFields.filter(field => field.label.trim()).length > 0
                ? customFields.filter(field => field.label.trim())
                : undefined}
              onUpdateFlashcard={updateFlashcard}
              onUpdateCustomField={updateCustomField}
              onRemoveFlashcard={removeFlashcard}
              onAddFlashcard={addFlashcard}
              onToggleExpansion={toggleCardExpansion}
            />
          )}

          {/* Bulk Import Mode */}
          {importMode === 'bulk' && (
            <BulkImportSection
              bulkText={bulkText}
              termDelimiter={termDelimiter}
              cardDelimiter={cardDelimiter}
              customTermDelimiter={customTermDelimiter}
              customCardDelimiter={customCardDelimiter}
              errors={errors}
              languageDisplay={languageDisplay}
              bulkCards={bulkCards}
              hasValidFormat={hasValidFormat}
              customFields={customFields.filter(field => field.label.trim()).length > 0
                ? customFields.filter(field => field.label.trim())
                : undefined}
              onBulkTextChange={setBulkText}
              onTermDelimiterChange={setTermDelimiter}
              onCardDelimiterChange={setCardDelimiter}
              onCustomTermDelimiterChange={setCustomTermDelimiter}
              onCustomCardDelimiterChange={setCustomCardDelimiter}
              getDelimiterChar={getDelimiterChar}
              getCardSeparator={getCardSeparator}
            />
          )}

          {/* Error Display */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Create Deck Button */}
          <div className="flex justify-end pt-8">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-3 px-5 py-8 text-md font-semibold rounded-xl"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Deck'
              )}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Pro tip: Use clear, concise questions and detailed answers for the best study experience</p>
        </div>
      </div>
    </div>
  );
}

export default CreateDeck;