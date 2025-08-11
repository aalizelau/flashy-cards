// src/features/auth/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/shared/services/firebase';
import { apiClient } from '../../../shared/services/api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/hooks/useApi';

const AuthContext = createContext(null);

export {auth};
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  // load both user and user profile
  const [firebaseLoadingUser, setFirebaseLoadingUser] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const hasCompletedOnboarding = Boolean(userProfile?.selected_language);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (fbUser) => {
        if (cancelled) return;

        setUser(fbUser);
        setProfileLoaded(false); 

        // not log in 
        if (!fbUser) {
          setUserProfile(null);
          setFirebaseLoadingUser(false);
          setProfileLoaded(true);
          return;
        }

        try {
          const profile = await apiClient.getUserProfile();
          if (cancelled) return;

          setUserProfile(profile ?? null);
        } catch (e) {
          if (cancelled) return;
          console.error('Failed to fetch user profile:', e);
          setError(e instanceof Error ? e : new Error(String(e)));
          setUserProfile(null);
        } finally {
          if (!cancelled) {
            setFirebaseLoadingUser(false);
            setProfileLoaded(true);
          }
        }
      },
      (e) => {
        if (cancelled) return;
        console.error('Auth state change error:', e);
        setError(e);
        setFirebaseLoadingUser(false);
        setProfileLoaded(true);
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { user: result.user, error: null };
    } catch (e) {
      console.error('Google sign-in error:', e);
      return { user: null, error: e?.message ?? 'Unknown error' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (e) {
      console.error('Logout error:', e);
      return { error: e?.message ?? 'Unknown error' };
    }
  };

  const getAuthToken = async () => {
    if (!user) throw new Error('User not authenticated');
    return user.getIdToken();
  };

  const setLanguage = async (language) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const updatedProfile = await apiClient.updateUserProfile({
        selected_language: language
      });
      setUserProfile(updatedProfile);
      
      // Invalidate all queries to refetch language-specific data
      await queryClient.invalidateQueries({ queryKey: queryKeys.decks });
      await queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      await queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
      
      // Also clear any cached deck cards
      queryClient.removeQueries({ queryKey: ['decks'], type: 'all' });
      
      return { error: null };
    } catch (e) {
      console.error('Failed to update language:', e);
      return { error: e?.message ?? 'Failed to update language' };
    }
  };

  const loading = firebaseLoadingUser || !profileLoaded;

  const value = useMemo(
    () => ({
      user,
      userProfile,
      hasCompletedOnboarding,
      loading,
      error,
      signInWithGoogle,
      logout,
      getAuthToken,
      setLanguage,
    }),
    [user, userProfile, hasCompletedOnboarding, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
