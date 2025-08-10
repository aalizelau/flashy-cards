import { useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../../../shared/services/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        setUser(user);
        setLoading(false);
        
        // 處理 onboarding 狀態
        if (user) {
          const onboardingKey = `onboarding_completed_${user.uid}`;
          const completed = localStorage.getItem(onboardingKey) === 'true';
          setHasCompletedOnboarding(completed);
        } else {
          setHasCompletedOnboarding(false);
        }
        setOnboardingLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(error);
        setLoading(false);
        setOnboardingLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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

export const useAuth = () => useContext(AuthContext);
export {auth};