import React from 'react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { LanguageSelector } from '@/shared/components/LanguageSelector';
import { Card } from '@/shared/components/ui/card';
import { User, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const { userProfile, setLanguage, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">Manage your account preferences and application settings</p>
        </div>

        <div className="grid gap-6">
          {/* User Profile Section */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <User className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold">Profile Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 text-sm">
                    {userProfile?.uid || 'N/A'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 text-sm">
                    {userProfile?.email || 'N/A'}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 text-sm">
                  {userProfile?.name || 'Not set'}
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>Account created: {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}</p>
                <p>Last updated: {userProfile?.updated_at ? new Date(userProfile.updated_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </Card>

          {/* Language Preferences */}
          <LanguageSelector
            currentLanguage={userProfile?.selected_language || 'en'}
            onLanguageChange={setLanguage}
            title="Language Preference"
            description="Choose your preferred language for flashcards and interface. This will determine which workspace you see."
            showConfirmation={true}
          />

          {/* Future Settings Sections */}
          <Card className="p-6 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Coming Soon</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Notification preferences</p>
              <p>• Study session defaults</p>
              <p>• Export/import data</p>
              <p>• Theme customization</p>
              <p>• Account management</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}