import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GoogleIcon from '@/assets/google-icon.png';
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, user } = useAuth();

  // Handle email/password sign-in (placeholder for future implementation)
  const handleSignIn = async () => {
    console.log('Email sign-in attempted:', { email, password });
    alert('Email sign-in functionality not implemented yet');
  };

  // Handle Google sign-in with Firebase
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { user, error } = await signInWithGoogle();
      
      if (error) {
        setError(error);
      } else if (user) {
        console.log('Google sign-in successful:', user);
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white bg-gradient-bg">
      <div className="bg-muted p-8 rounded-lg w-full max-w-sm shadow-card border border-gray-600">
        {/* <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Logo" className="h-12" />
        </div> */}
        <h1 className="text-4xl font-bold mb-6 text-center font-alumni-sans text-muted-foreground">Ready to Join?</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="border border-gray-300 bg-gray-50 px-4 py-3 rounded w-full flex items-center justify-center hover:bg-gray-100 font-normal mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img src={GoogleIcon} alt="Google" className="h-5 mr-2" />
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <div className="relative text-center my-4 mb-4">
          <span className="absolute left-0 top-1/2 w-full border-t border-gray-300"></span>
          <span className="relative bg-muted px-2 text-gray-500">OR</span>
        </div>

        <div className="flex items-center border border-gray-300 rounded bg-gray-50 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 px-3 mb-3 gap-x-2">
          <Mail className="ml-3 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 p-3 bg-transparent border-none outline-none"
          />
        </div>

        <div className="flex items-center border border-gray-300 rounded bg-gray-50 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 px-3 mb-6 gap-x-2">
          <Lock className="ml-3 text-gray-400 h-5 w-5" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 p-3 bg-transparent border-none outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="mr-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <button
          onClick={handleSignIn}
          className="bg-main-foreground text-white px-4 py-2 rounded w-full hover:bg-[#4C4BD0] font-normal mt-6 mb-4"
        >
          Log in
        </button>

        <div className="flex justify-between text-sm text-gray-500 my-4">
          <a 
            href="/forgot-password"
            className="hover:underline text-primary/90"
          >
            Forgot password?
          </a>
          <a 
            href="/signup"
            className="hover:underline text-primary/90"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}