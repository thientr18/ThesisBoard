import { useAuth0 } from '@auth0/auth0-react';
import Navbar from '../components/common/navigation/Navbar';

const Dashboard = () => {
  const { user, logout } = useAuth0();

  return (
    <>
      <Navbar
        userName={user?.name}
        onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      />
      
    </>
  );
};

export default Dashboard;