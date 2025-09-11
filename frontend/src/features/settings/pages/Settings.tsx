import React, { useState } from 'react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { LanguageSelector } from '@/shared/components/LanguageSelector';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { User, Settings as SettingsIcon, Download, Loader2 } from 'lucide-react';
import { apiClient } from '@/shared/services/api';

export default function Settings() {
  const { userProfile, setLanguage, loading } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      // Call the export API
      const exportData = await apiClient.exportAllData();
      
      // Create a downloadable JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `flash-wise-buddy-export-${timestamp}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

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
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-semibold text-main-foreground font-alumni-sans">SETTINGS</h1>
          </div>
        </div>

        <div className="grid gap-6">
          {/* User Profile Section */}
          <div>
            <h2 className="text-md font-semibold text-gray-700 mb-3">Profile Information</h2>
            <Card className="p-6">

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
          </div>

          {/* Language Preferences */}
          <div>
            <h2 className="text-md font-semibold text-gray-700 mb-3">Language Preference</h2>
            <LanguageSelector
              currentLanguage={userProfile?.selected_language || 'en'}
              onLanguageChange={setLanguage}
              title=""
              description="Choose one language to learn:"
              showConfirmation={true}
            />
          </div>

          {/* Data Management */}
          <div>
            <h2 className="text-md font-semibold text-gray-700 mb-3">Export/ Import</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Download all your flashcards, decks, and progress data as a JSON file. 
                    This can be used for backup or importing into another device.
                  </p>
                  <Button
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="flex items-center gap-2"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isExporting ? 'Exporting...' : 'Export All Data'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Future Settings Sections */}
          <Card className="p-6 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Coming Soon</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Notification preferences</p>
              <p>• Study session defaults</p>
              <p>• Import data</p>
              <p>• Theme customization</p>
              <p>• Account management</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}