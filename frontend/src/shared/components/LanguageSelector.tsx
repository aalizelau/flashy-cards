import { useState } from 'react';
import { Card } from "@/shared/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Globe, Loader2 } from "lucide-react";

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
];

interface LanguageSelectorProps {
  currentLanguage?: string;
  onLanguageChange: (languageCode: string) => Promise<{ error: string | null }>;
  title?: string;
  description?: string;
  showConfirmation?: boolean;
  compact?: boolean;
}

export function LanguageSelector({
  currentLanguage = 'en',
  onLanguageChange,
  title = "Select Language",
  description = "Choose your preferred language",
  showConfirmation = true,
  compact = false
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [isLoading, setIsLoading] = useState(false);

  const currentLang = LANGUAGES.find(lang => lang.code === currentLanguage);
  const hasChanges = selectedLanguage !== currentLanguage;

  const handleSave = async () => {
    if (!hasChanges) return;
    
    if (showConfirmation) {
      const selectedLang = LANGUAGES.find(lang => lang.code === selectedLanguage);
      const confirmed = window.confirm(
        `Switch to ${selectedLang?.name}? This will reload your workspace with ${selectedLang?.name}-specific content.`
      );
      if (!confirmed) return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await onLanguageChange(selectedLanguage);
      if (result.error) {
        alert(`Failed to change language: ${result.error}`);
        setSelectedLanguage(currentLanguage); // Reset on error
      }
    } catch (error) {
      console.error('Language change error:', error);
      alert('Failed to change language. Please try again.');
      setSelectedLanguage(currentLanguage); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedLanguage(currentLanguage);
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-gray-500" />
          <div>
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <RadioGroup
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
            className="grid grid-cols-2 gap-2"
          >
            {LANGUAGES.map((language) => (
              <div key={language.code} className="relative">
                <RadioGroupItem
                  value={language.code}
                  id={`lang-${language.code}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`lang-${language.code}`}
                  className={`
                    flex items-center gap-2 p-2 border rounded-md cursor-pointer text-xs
                    bg-white hover:bg-gray-50
                    peer-data-[state=checked]:border-blue-500
                    peer-data-[state=checked]:bg-blue-50
                    transition-colors
                  `}
                >
                  <span className="text-sm">{language.flag}</span>
                  <span className="font-medium">{language.name}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          {hasChanges && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <p className="text-gray-600">{description}</p>
        {currentLang && (
          <p className="text-sm text-gray-500 mt-1">
            Currently using: <span className="font-medium">{currentLang.flag} {currentLang.name}</span>
          </p>
        )}
      </div>
      
      <div className="space-y-4">
        <RadioGroup
          value={selectedLanguage}
          onValueChange={setSelectedLanguage}
          className="grid grid-cols-2 gap-3"
        >
          {LANGUAGES.map((language) => (
            <div key={language.code} className="relative">
              <RadioGroupItem
                value={language.code}
                id={`lang-${language.code}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`lang-${language.code}`}
                className={`
                  flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer
                  bg-gray-50 hover:bg-primary/5 hover:text-accent-foreground
                  peer-data-[state=checked]:border-blue-500
                  peer-data-[state=checked]:bg-blue-50
                  transition-colors
                `}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="text-sm font-medium">{language.name}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {hasChanges && (
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Cancel Changes
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Language Preference
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}