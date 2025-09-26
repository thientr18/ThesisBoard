import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchUsers, fetchPublicData } from '../api/userApi';

export function useUsers() {
  const [protectedData, setProtectedData] = useState<any>(null);
  const [publicData, setPublicData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAuth0();

  useEffect(() => {
    // Fetch public data regardless of authentication status
    fetchPublicData()
      .then(data => setPublicData(data))
      .catch(err => console.error('Error fetching public data:', err));
    
    // Only fetch protected data if user is authenticated
    if (isAuthenticated) {
      setLoading(true);
      fetchUsers()
        .then(data => {
          setProtectedData(data);
          setError(null);
        })
        .catch(err => {
          console.error('Error in useUsers hook:', err);
          setError(err as Error);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return { protectedData, publicData, loading, error };
}