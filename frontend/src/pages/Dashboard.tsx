import { useAuth0 } from '@auth0/auth0-react';
import Navbar from '../components/common/navigation/Navbar'; // Đường dẫn có thể cần chỉnh lại

const Dashboard = () => {
  const { user, logout } = useAuth0();

  return (
    <>
      <Navbar
        userName={user?.name}
        onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Welcome, {user?.name || 'User'}</h2>
          <p className="text-gray-600">You are now logged into the Thesis Board application.</p>
          
          <div className="mt-4">
            <button 
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Log Out
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Your Theses</h3>
            <p className="text-gray-600">No theses found. Start by creating a new thesis.</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
            <p className="text-gray-600">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;