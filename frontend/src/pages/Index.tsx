import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Only redirect once auth state is determined and user is authenticated
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, user, loading]);

  // Show loading state while checking auth or redirecting
  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-700">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
