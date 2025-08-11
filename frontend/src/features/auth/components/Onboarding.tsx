import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from "@/shared/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Label } from "@/shared/components/ui/label";
import { PartyPopper, Globe, ArrowLeft } from "lucide-react";

export default function Onboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const { completeOnboarding, user } = useAuth();
  const navigate = useNavigate();

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "uk", name: "Українська", flag: "🇺🇦" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
  ];

  const handleGetStarted = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }
    
    // Step 2: Complete onboarding
    if (!selectedLanguage) {
      alert('Please select a language to continue');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate a brief loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    completeOnboarding();
    navigate('/dashboard', { replace: true });
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
      <div className="shadow-card">
      <Card className="bg-muted rounded-lg p-8 max-w-md w-full text-center">
        {currentStep === 1 && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PartyPopper className="w-8 h-8 text-main-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-main-foreground mb-2">
                Welcome to Flashy Cards!
              </h1>
              <p className="text-muted-foreground">
                Ready to start your journey?
              </p>
            </div>

            <div className="mb-8 space-y-4 text-left">
              <Card className="p-6 bg-gray-50 shadow-[var(--shadow-card)] space-y-6">
                <div className="flex items-start gap-4">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-semibold">1</span>
                </div>
                  <div className="space-y-1 text-left">
                    <h3 className="font-medium text-foreground">Browse & Create Flashcards</h3>
                    <p className="text-sm text-muted-foreground">
                      Organize your study materials into decks
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm font-semibold">2</span>
                </div>
                  <div className="space-y-1 text-left">
                    <h3 className="font-medium text-foreground">Study & Test Yourself</h3>
                    <p className="text-sm text-muted-foreground">
                      Multiple study modes to choose
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 text-sm font-semibold">3</span>
                </div>
                  <div className="space-y-1 text-left">
                    <h3 className="font-medium text-foreground">Track Your Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Analytics to help you improve
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-main-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-main-foreground mb-2">
                Choose Your Language to Learn
              </h1>
              <p className="text-muted-foreground">
                More languages are coming soon
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <RadioGroup
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
                className="grid grid-cols-2 gap-3"
              >
                {languages.map((language) => (
                  <div key={language.code} className="relative">
                    <RadioGroupItem
                      value={language.code}
                      id={`lang-${language.code}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`lang-${language.code}`}
                      className="
                        flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer
                        bg-gray-50 hover:bg-primary/5 hover:text-accent-foreground
                        peer-data-[state=checked]:border-accent
                        peer-data-[state=checked]:bg-primary/5
                        transition-colors
                      "
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span className="text-sm font-medium">{language.name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

      </div>
          </>
        )}

        <div className="flex gap-3">
          {currentStep === 2 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            onClick={handleGetStarted}
            disabled={isLoading || (currentStep === 2 && !selectedLanguage)}
            className="flex-1 bg-muted-foreground hover:bg-main-foreground disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isLoading ? 'Setting things up...' : 
             currentStep === 1 ? 'Get Started' : 'Complete Setup'}
          </button>
        </div>
      </Card>
      </div>
    </div>
  );
}