import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider } from '../../../shared/services/firebase';

interface ProtectedRouteProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

const ProtectedRoute = ({ children, requireOnboarding = true }: ProtectedRouteProps) => {
  // const { user, loading, hasCompletedOnboarding } = useAuthState(auth);
  const [user, loading, error] = useAuthState(auth);
  const location = useLocation();

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated, preserving intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasCompletedOnboarding = (uid: string) => {
  const onboardingKey = `onboarding_completed_${uid}`;
  const stored = localStorage.getItem(onboardingKey);
  console.log("status!!!", stored)
  return stored === 'true';
};

  // If onboarding is required and user hasn't completed it, redirect to onboarding
  // But don't redirect if already on onboarding page to prevent infinite loops
  if (!loading && user && requireOnboarding && !hasCompletedOnboarding(user.uid) && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // User is authenticated and has completed required onboarding, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;