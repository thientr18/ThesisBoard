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
import Sidebar from '../components/common/navigation/Sidebar';
import {
  LayoutProvider,
  useLayoutContext,
  SIDEBAR_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH
} from '../contexts/LayoutContext';

const DashboardContent = ({ user, loading, error, onLogout }: {
  user: UserWithRoles | null;
  loading: boolean;
  error: string | null;
  onLogout: () => void;
}) => {
  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <>
      <Sidebar user={user} />
      <div
        className="flex-1 flex flex-col"
        style={{
          marginLeft: sidebarWidth,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
          minHeight: "100vh",
        }}
      >
        <Navbar
          user={user}
          pageName="Dashboard"
          onLogout={onLogout}
        />
        {loading ? (
          <LoadingSpinner size="large" tip="Loading dashboard..." fullscreen />
        ) : error ? (
          <main className="px-6 py-8 max-w-7xl mx-auto">
            <Alert
              type="error"
              message="Failed to load user data"
              description={error}
              showIcon
            />
          </main>
        ) : (
          <>
            <main className="px-6 py-8 max-w-7xl mx-auto flex-1">
              <AnnouncementLayout user={user} />
            </main>
            <Separator />
            <section className="bg-white py-12">
              <Contact />
            </section>
          </>
        )}
      </div>
    </>
  );
};

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

  return (
    <LayoutProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <DashboardContent
          user={user}
          loading={loading}
          error={error}
          onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        />
      </div>
    </LayoutProvider>
  );
};

export default Dashboard;