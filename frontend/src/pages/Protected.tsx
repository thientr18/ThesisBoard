import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export default function Protected() {
  const { getAccessTokenSilently, user, logout } = useAuth0();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
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

        const responseData = await response.json();
        setData(responseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAccessTokenSilently]);

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Protected Page</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
        
        {user && (
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">User Profile</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <img 
                src={user.picture} 
                alt={user.name || 'User'} 
                className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200"
              />
              <div className="space-y-2 text-center sm:text-left">
                <p className="font-medium"><span className="text-gray-600">Name:</span> {user.name}</p>
                <p className="font-medium"><span className="text-gray-600">Email:</span> {user.email}</p>
              </div>
            </div>
          </div>
        )}
        
        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            Error: {error}
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">API Response:</h2>
            <pre className="bg-gray-200 p-4 rounded overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}