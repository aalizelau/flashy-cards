"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import type { Deck } from "@/shared/types/api"

interface DeckSelectionModalProps {
  decks: Deck[]
  onContinue: (selectedDeckIds: number[]) => void
  onClose: () => void
}

export const DeckSelectionModal: React.FC<DeckSelectionModalProps> = ({ 
  decks, 
  onContinue, 
  onClose 
}) => {
  const [selectedDeckIds, setSelectedDeckIds] = useState<number[]>([])

  const handleDeckToggle = (deckId: number) => {
    setSelectedDeckIds(prev => 
      prev.includes(deckId) 
        ? prev.filter(id => id !== deckId)
        : [...prev, deckId]
    )
  }

  const handleContinue = () => {
    if (selectedDeckIds.length > 0) {
      onContinue(selectedDeckIds)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-200 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-gray-700">Which Decks?</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Deck List */}
        <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
          {decks.map((deck) => (
            <div key={deck.id} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={`deck-${deck.id}`}
                checked={selectedDeckIds.includes(deck.id)}
                onChange={() => handleDeckToggle(deck.id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor={`deck-${deck.id}`} className="flex-1 cursor-pointer">
                <div className="text-lg font-medium text-gray-900">{deck.name}</div>
                <div className="text-sm text-gray-500">{deck.card_count} words</div>
              </label>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-4">
          {/* Selection Counter */}
          <div className="mb-4 text-center">
            <span className="text-gray-500">
              {selectedDeckIds.length} deck{selectedDeckIds.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={selectedDeckIds.length === 0}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              selectedDeckIds.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}