import React, { useState, useRef } from 'react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { LanguageSelector } from '@/shared/components/LanguageSelector';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { User, Settings as SettingsIcon, Download, Upload, Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { apiClient } from '@/shared/services/api';

export default function Settings() {
  const { userProfile, setLanguage, loading, logout } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      alert('Please select a JSON file');
      return;
    }

    // Confirm destructive action
    const confirmed = window.confirm(
      'This will PERMANENTLY DELETE all your current data and replace it with the imported data.\n\n' +
      'This action cannot be undone. Make sure you have exported your current data as backup.\n\n' +
      'Do you want to continue?'
    );

    if (!confirmed) {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      setIsImporting(true);
      
      const result = await apiClient.importAllData(file);
      
      if (result.success) {
        alert(`Import successful!\n\nImported:\n• ${result.imported_decks} decks\n• ${result.imported_cards} cards\n\nThe page will now reload.`);
        // Reload the page to refresh all data
        window.location.reload();
      } else {
        alert(`Import failed: ${result.message}`);
      }
      
    } catch (error) {
      console.error('Import failed:', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAccount = async () => {
    // First confirmation
    const firstConfirm = window.confirm(
      'Are you sure you want to delete your account?\n\n' +
      'This will PERMANENTLY DELETE:\n' +
      '• All your flashcard decks\n' +
      '• All your study progress\n' +
      '• All your analytics data\n' +
      '• Your user profile\n\n' +
      'This action cannot be undone!'
    );

    if (!firstConfirm) return;

    // Second confirmation for extra safety
    const secondConfirm = window.confirm(
      'FINAL WARNING!\n\n' +
      'You are about to permanently delete your account and ALL associated data.\n\n' +
      'Type "DELETE" in your mind and click OK to proceed, or Cancel to abort.'
    );

    if (!secondConfirm) return;

    try {
      setIsDeleting(true);

      // Call the delete account API
      await apiClient.deleteAccount();

      // Show success message
      alert('Your account has been successfully deleted. You will now be logged out.');

      // Log out the user
      await logout();

      // Redirect to home/login page
      window.location.href = '/';

    } catch (error) {
      console.error('Account deletion failed:', error);
      alert(`Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
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
            <h2 className="text-md font-semibold text-gray-700 mb-3">Data Management</h2>
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  {/* <h3 className="text-sm font-medium text-gray-700 mb-2">Export Your Data</h3> */}
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
                    {isExporting ? 'Exporting...' : 'Export Data'}
                  </Button>
                </div>

                <div className="border-t pt-6">
                  {/* <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    Import Data
                  </h3> */}
                  <p className="text-sm text-gray-600 mb-4">
                    This will
                    replace all your current data it with the imported data. Make sure to export your current data first as backup.
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      disabled={isImporting}
                      className="hidden"
                      id="import-file"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImporting}
                      className="flex items-center gap-2"
                    >
                      {isImporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {isImporting ? 'Importing...' : 'Import Data'}
                    </Button>
                  </div>
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
              <p>• Theme customization</p>
              <p>• Account management</p>
            </div>
          </Card>

          {/* Account Deletion Section */}
          <div>
            <h2 className="text-md font-semibold text-gray-700 mb-3">Danger Zone</h2>
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    {/* <h3 className="text-sm font-medium text-red-800 mb-2">Delete Account</h3> */}
                    <p className="text-sm text-red-700 ">
                      Permanently delete your account and all associated data including flashcards,
                      study progress, and analytics. This action cannot be undone.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {isDeleting ? 'Deleting Account...' : 'Delete Account'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}