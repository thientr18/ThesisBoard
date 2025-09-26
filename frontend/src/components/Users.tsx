import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';

export default function Users() {
  const { isAuthenticated, isLoading: authLoading, user, login, logout } = useAuth();
  const { protectedData, publicData, loading: dataLoading, error } = useUsers();

  if (authLoading) {
    return <div>Loading authentication status...</div>;
  }

  return (
    <div>
      <h2>Auth0 Authentication Demo</h2>
      
      {isAuthenticated ? (
        <div>
          <div className="profile">
            <h3>User Profile</h3>
            <img 
              src={user?.picture} 
              alt={user?.name} 
              style={{ width: '50px', borderRadius: '50%' }} 
            />
            <div>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
            <button onClick={logout}>Log Out</button>
          </div>
          
          <div className="api-data">
            <h3>API Data</h3>
            {dataLoading ? (
              <p>Loading protected data...</p>
            ) : error ? (
              <p>Error: {error.message}</p>
            ) : (
              <pre>{JSON.stringify(protectedData, null, 2)}</pre>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p>You are not logged in.</p>
          <button onClick={login}>Log In</button>
        </div>
      )}

      <div className="public-data">
        <h3>Public API Data</h3>
        {publicData ? (
          <pre>{JSON.stringify(publicData, null, 2)}</pre>
        ) : (
          <p>Loading public data...</p>
        )}
      </div>
    </div>
  );
}