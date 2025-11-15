import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/common/navigation/Navbar';
import AnnouncementLayout from '../components/dashboard/AnnouncementLayout';
import Contact from '../components/dashboard/Contact';
import Separator from '../components/common/display/Separator';
import { LoadingSpinner } from '../components/common/feedback/LoadingSpinner';
import { Alert } from '../components/common/feedback/Alert';
import { useUserApi } from '../api/endpoints/user.api';
import type { UserWithRoles } from '../types/user.types';

const Dashboard = () => {
  const { logout, isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();
  const { getMe } = useUserApi();

  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!isAuthenticated) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await getAccessTokenSilently();
      const { data, error } = await getMe();
      if (error) {
        setError(error);
        setUser(null);
      } else {
        setUser(data as UserWithRoles ?? null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, getAccessTokenSilently, getMe]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar
          userName={user?.fullName}
          onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        />
        <LoadingSpinner size="large" tip="Loading dashboard..." fullscreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar
          userName={user?.fullName}
          onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        />
        <main className="px-6 py-8 max-w-7xl mx-auto">
          <Alert
            type="error"
            message="Failed to load user data"
            description={error}
            showIcon
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        userName={user?.fullName}
        onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      />

      {/* Main Content */}
      <main className="px-6 py-8 max-w-7xl mx-auto">
        <AnnouncementLayout user={user} />
      </main>

      {/* Contact Section */}
      <Separator />
      <section className="bg-white py-12">
        <Contact />
      </section>
    </div>
  );
};

export default Dashboard;