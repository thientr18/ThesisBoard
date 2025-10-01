import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const { isAuthenticated, isLoading, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Successfully authenticated, redirect to dashboard or saved return path
        navigate('/dashboard');
      } else if (error) {
        // Authentication failed, redirect to login
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, error, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Processing authentication...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default Callback;