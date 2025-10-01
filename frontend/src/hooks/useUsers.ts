import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchPublicData } from '../api/userApi';

export function useUsers() {
  const [protectedData, setProtectedData] = useState<any>(null);
  const [publicData, setPublicData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    // Fetch public data regardless of authentication
    fetchPublicData()
      .then(data => setPublicData(data))
      .catch(err => console.error('Error fetching public data:', err));
    
    // Only fetch protected data if authenticated
    if (isAuthenticated) {
      setLoading(true);
      
      const fetchProtectedData = async () => {
        try {
          const token = await getAccessTokenSilently();
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/protected`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch protected data');
          }
  
          const data = await response.json();
          setProtectedData(data);
          setError(null);
        } catch (err) {
          console.error('Error in useUsers hook:', err);
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchProtectedData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return { protectedData, publicData, loading, error };
}