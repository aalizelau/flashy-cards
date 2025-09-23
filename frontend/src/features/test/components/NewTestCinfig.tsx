"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, WalletCards, Clock, Flame } from "lucide-react"
import type { Deck, TestStats } from "@/shared/types/api"
import '@/styles/Slider.css'
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { apiClient } from "@/shared/services/api";

export type TestType = 'all_words' | 'newly_added' | 'not_familiar'

export interface TestConfig {
  testType: TestType
  wordCount: number
  swapSides: boolean
  progressThreshold?: number
  deckIds?: number[]
}

interface TestConfigModalProps {
  deck: Deck
  testStats?: TestStats | null
  selectedDeckIds?: number[]
  onStart: (config: TestConfig) => void
  onClose: () => void
}

interface TestTypeOption {
  type: TestType
  label: string
  description: string
  icon: React.ReactNode
  getAvailableCount: (stats?: TestStats | null) => number
}

export const TestConfigModal: React.FC<TestConfigModalProps> = ({
  deck,
  testStats,
  selectedDeckIds,
  onStart,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [testType, setTestType] = useState<TestType>('all_words')
  const [wordCount, setWordCount] = useState(10)
  const [swapSides, setSwapSides] = useState(false)
  const [progressThreshold, setProgressThreshold] = useState(50)
  const [dynamicStats, setDynamicStats] = useState<TestStats | null>(testStats)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  const testTypeOptions: TestTypeOption[] = [
    {
      type: 'all_words',
      label: 'All Words',
      description: 'Test all available cards in the deck',
      icon: <WalletCards className="w-5 h-5" />,
      getAvailableCount: (stats) => stats?.total_cards ?? deck.card_count
    },
    {
      type: 'newly_added',
      label: 'Newly Added',
      description: 'Focus on recently added cards',
      icon: <Clock className="w-5 h-5" />,
      getAvailableCount: (stats) => stats?.newly_added_count ?? 0
    },
    {
      type: 'not_familiar',
      label: 'Not Familiar',
      description: 'Practice cards below your progress threshold',
      icon: <Flame className="w-5 h-5" />,
      getAvailableCount: (stats) => stats?.unfamiliar_count ?? 0
    }
  ]

  const currentOption = testTypeOptions.find(option => option.type === testType)!
  const availableCards = currentOption.getAvailableCount(dynamicStats)
  const maxWords = Math.max(1, availableCards)

  // Update stats when threshold changes (for unfamiliar test type)
  useEffect(() => {
    if (testType === 'not_familiar' && selectedDeckIds && selectedDeckIds.length > 0) {
      const fetchStats = async () => {
        setIsLoadingStats(true)
        try {
          const stats = await apiClient.getTestStats('test_unfamiliar', selectedDeckIds, progressThreshold)
          setDynamicStats(stats)
        } catch (error) {
          console.error('Failed to fetch threshold-based stats:', error)
        } finally {
          setIsLoadingStats(false)
        }
      }

      // Debounce the API call
      const timeoutId = setTimeout(fetchStats, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [progressThreshold, selectedDeckIds])

  // Reset dynamic stats when test type changes
  useEffect(() => {
    if (testType !== 'not_familiar') {
      setDynamicStats(testStats)
    }
  }, [testType, testStats])

  useEffect(() => {
    setWordCount(Math.min(10, maxWords))
  }, [testType, maxWords])

  const handleTestTypeChange = (type: TestType) => {
    setTestType(type)
  }

  const nextStep = () => {
    setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleWordCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWordCount(Number.parseInt(e.target.value))
  }

  const handleProgressThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgressThreshold(Number.parseInt(e.target.value))
  }

  const handleStart = () => {
    const config: TestConfig = {
      testType,
      wordCount,
      swapSides,
      ...(testType === 'not_familiar' && { progressThreshold }),
      ...(selectedDeckIds && selectedDeckIds.length > 0 && { deckIds: selectedDeckIds })
    }
    onStart(config)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-[var(--shadow-modal)] 
                   border border-section-border overflow-hidden transform transition-all duration-300 
                   animate-in fade-in-0 zoom-in-95"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b border-section-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-semibold text-main-foreground font-alumni-sans">Configure Test</h2>
              {/* <p className="text-sm text-text-secondary mt-1">{deck.name}</p> */}
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/80 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Test Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="grid gap-3">
                {testTypeOptions.map((option) => {
                  const isSelected = testType === option.type
                  const count = option.getAvailableCount(testStats)

                  return (
                    <button
                      key={option.type}
                      onClick={() => handleTestTypeChange(option.type)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-option-selected bg-option-selected-bg shadow-[var(--shadow-option)]'
                          : 'border-option-border bg-option-background hover:border-option-selected/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-accent text-white' : 'bg-section-background text-muted-foreground'
                          }`}>
                            {option.icon}
                          </div>
                          <div>
                            <div className={`font-semibold ${
                              isSelected ? 'text-text-accent' : 'text-text-primary'
                            }`}>
                              {option.label}
                            </div>
                            <div className="text-sm text-text-secondary mt-1">
                              {option.description}
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm font-medium px-2 py-1 rounded-md ${
                          isSelected 
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {isLoadingStats && option.type === 'not_familiar' ? '...' : `${count} cards`}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Configuration Options */}
          {currentStep === 2 && (
            <div className="space-y-6">
                {/* Progress Threshold (only for 'not_familiar') */}
                {testType === 'not_familiar' && (
                <div className="flex items-center justify-between p-4 bg-section-background rounded-xl border border-section-border">
                  <div className="w-80">
                    <Label className="text-sm font-medium text-text-primary mb-2 block">
                      Progress Threshold
                    </Label>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      step="10"
                      value={progressThreshold}
                      onChange={handleProgressThresholdChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-muted-foreground">
                      {progressThreshold}%
                    </div>
                    <div className="text-xs text-text-secondary">
                      below
                    </div>
                  </div>
                </div>
              )}
              {/* Word Count Selection */}
              {availableCards > 0 && (
                <div className="flex items-center justify-between p-4 bg-section-background rounded-xl border border-section-border">
                  <div className="w-80">
                    <Label className="text-sm font-medium text-text-primary mb-2 block">
                      Number of Cards
                    </Label>
                    <input
                      type="range"
                      min="1"
                      max={maxWords}
                      value={wordCount}
                      onChange={handleWordCountChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-muted-foreground">
                      {wordCount}
                    </div>
                    <div className="text-xs text-text-secondary">
                      of {isLoadingStats && testType === 'not_familiar' ? '...' : availableCards}
                    </div>
                  </div>
                </div>
              )}

              {/* Swap Sides Toggle */}
              <div className="flex items-center justify-between p-4 bg-section-background rounded-xl border border-section-border">
                <div className="space-y-1">
                  <Label htmlFor="swap-sides" className="text-sm font-medium text-text-primary">
                    Swap Front and Back
                  </Label>
                  <p className="text-xs text-text-secondary">
                    Show back of cards first instead of front
                  </p>
                </div>
                <Switch
                  id="swap-sides"
                  checked={swapSides}
                  onCheckedChange={setSwapSides}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-section-background/50 border-t border-section-border">
          <div className="flex gap-3">
            {/* Cancel / Back Button */}
            <button
              onClick={currentStep === 1 ? onClose : prevStep}
              className="flex-1 px-4 py-3 border border-option-border rounded-xl text-text-secondary
                         hover:bg-option-background hover:border-option-selected/30 transition-all duration-200"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            {/* Next / Start Test Button */}
            {currentStep === 1 ? (
              <button
                onClick={nextStep}
                disabled={availableCards === 0}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                           font-semibold transition-all duration-200 ${
                  availableCards === 0
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary/10 text-main-foreground hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {availableCards === 0 ? 'No Cards Available' : 'Next'}
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={availableCards === 0}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                           font-semibold transition-all duration-200 ${
                  availableCards === 0
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary/10 text-main-foreground hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {availableCards === 0 ? 'No Cards Available' : 'Start Test'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}