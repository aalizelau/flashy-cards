import { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider } from '../../../shared/services/firebase';

// Export auth instance for use by API client
export { auth };

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, loading, error] = useAuthState(auth);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(true);

  // Check onboarding status when user changes
  useEffect(() => {
    if (user) {
      const onboardingKey = `onboarding_completed_${user.uid}`;
      const completed = localStorage.getItem(onboardingKey) === 'true';
      setHasCompletedOnboarding(completed);
    } else {
      setHasCompletedOnboarding(false);
    }
    setOnboardingLoading(false);
  }, [user]);

  // skip loading state and log user detail 
  if (!loading && user) {
    console.log('User successfully authenticated:', user);
  }

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { user: result.user, error: null };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { user: null, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { error: error.message };
    }
  };

  const getAuthToken = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      const token = await user.getIdToken();
      return token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      throw error;
    }
  };

  const completeOnboarding = () => {
    if (user) {
      const onboardingKey = `onboarding_completed_${user.uid}`;
      localStorage.setItem(onboardingKey, 'true');
      setHasCompletedOnboarding(true);
    }
  };

  const value = {
    user,
    loading: loading || onboardingLoading,
    error,
    signInWithGoogle,
    logout,
    getAuthToken,
    isAuthenticated: !!user,
    hasCompletedOnboarding,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};