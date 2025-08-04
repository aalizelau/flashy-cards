"use client"

import type React from "react"
import { useState } from "react"
import { X, Play } from "lucide-react"
import type { Deck } from "@/shared/types/api"
import '@/styles/Slider.css'

interface TestConfigModalProps {
  deck: Deck
  onStart: (wordCount: number) => void
  onClose: () => void
}

export const TestConfigModal: React.FC<TestConfigModalProps> = ({ deck, onStart, onClose }) => {
  const [wordCount, setWordCount] = useState(Math.min(10, deck.card_count))
  const maxWords = deck.card_count

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWordCount(Number.parseInt(e.target.value))
  }

  const handleStart = () => {
    onStart(wordCount)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-200 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-main-foreground font-alumni-sans">Configure Test</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Collection Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-1">{deck.name}</h3>
          <p className="text-sm text-gray-500">{deck.card_count} words available</p>
        </div>

        {/* Word Count Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-900">Number of words to test</label>
            <span className="text-lg font-semibold text-muted-foreground">{wordCount}</span>
          </div>

          <div className="relative">
            <input
              type="range"
              min="1"
              max={maxWords}
              value={wordCount}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>1</span>
              <span>{maxWords}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="flex-1 flex items-center justify-center gap-2 bg-main-foreground text-white px-4 py-3 rounded-lg transition-colors "
          >
            {/* <Play className="w-4 h-4" /> */}
            Start Test
          </button>
        </div>
      </div>
    </div>
  )
}
