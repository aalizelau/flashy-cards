import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Onboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const { completeOnboarding, user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    setIsLoading(true);
    
    // Simulate a brief loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    completeOnboarding();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Flash Wise Buddy! 🎉
          </h1>
          <p className="text-gray-600">
            Hi {user?.displayName?.split(' ')[0] || 'there'}! Ready to start your learning journey?
          </p>
        </div>

        <div className="mb-8 space-y-4 text-left">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-semibold">1</span>
            </div>
            <div>
              <p className="text-gray-800 font-medium">Browse & Create Flashcards</p>
              <p className="text-gray-600 text-sm">Organize your study materials into decks</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 text-sm font-semibold">2</span>
            </div>
            <div>
              <p className="text-gray-800 font-medium">Study & Test Yourself</p>
              <p className="text-gray-600 text-sm">Multiple study modes to fit your learning style</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-600 text-sm font-semibold">3</span>
            </div>
            <div>
              <p className="text-gray-800 font-medium">Track Your Progress</p>
              <p className="text-gray-600 text-sm">Analytics to help you improve</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleGetStarted}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? 'Setting things up...' : 'Get Started'}
        </button>

        <p className="text-xs text-gray-500 mt-4">
          You can always access this information from the help section
        </p>
      </div>
    </div>
  );
}