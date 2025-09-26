import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';

export default function Users() {
  const { isAuthenticated, isLoading: authLoading, user, login, logout } = useAuth();
  const { protectedData, publicData, loading: dataLoading, error } = useUsers();

  if (authLoading) {
    return <div className="flex justify-center items-center p-8">
      <div className="animate-pulse text-gray-600">Loading authentication status...</div>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-indigo-700 mb-8">Auth0 Authentication Demo</h2>
      
      {isAuthenticated ? (
        <div className="space-y-8">
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">User Profile</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <img 
                src={user?.picture} 
                alt={user?.name || 'User'} 
                className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200"
              />
              <div className="space-y-2 text-center sm:text-left">
                <p className="font-medium"><span className="text-gray-600">Name:</span> {user?.name}</p>
                <p className="font-medium"><span className="text-gray-600">Email:</span> {user?.email}</p>
                <button 
                  onClick={logout}
                  className="mt-4 px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Protected API Data</h3>
            {dataLoading ? (
              <div className="h-20 flex items-center justify-center">
                <div className="animate-pulse text-gray-600">Loading protected data...</div>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                Error: {error.message}
              </div>
            ) : (
              <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(protectedData, null, 2)}
              </pre>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 flex flex-col items-center">
          <p className="text-lg text-gray-700 mb-4">You are not logged in.</p>
          <button 
            onClick={login}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Log In
          </button>
        </div>
      )}

      <div className="mt-8 bg-gray-50 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Public API Data</h3>
        {publicData ? (
          <pre className="bg-gray-800 text-blue-400 p-4 rounded-md overflow-x-auto text-sm">
            {JSON.stringify(publicData, null, 2)}
          </pre>
        ) : (
          <div className="h-20 flex items-center justify-center">
            <div className="animate-pulse text-gray-600">Loading public data...</div>
          </div>
        )}
      </div>
    </div>
  );
}