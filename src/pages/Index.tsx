import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to dashboard on initial load
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
