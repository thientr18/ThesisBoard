import React, { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserApi } from '../api/endpoints/user.api';
import type { UserWithRoles } from '../types/user.types';
import {
  ProfileHeader,
  TeacherPanel,
  StudentPanel,
} from '../components/profile';
import Card from '../components/common/display/Card';
import Separator from '../components/common/display/Separator';
import Navbar from '../components/common/navigation/Navbar';
import Sidebar from '../components/common/navigation/Sidebar';
import {
  LayoutProvider,
  useLayoutContext,
  SIDEBAR_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH
} from '../contexts/LayoutContext';

const renderRolePanel = (role: string, user: UserWithRoles) => {
  switch (role) {
    case 'student':
      return <StudentPanel user={user} />;
    case 'teacher':
      return <TeacherPanel user={user} />;
    case 'admin':
      return <StudentPanel user={user} />;
    default:
      return null;
  }
};

const ProfileContent: React.FC<{
  user: UserWithRoles | null;
  loading: boolean;
  error: string | null;
  onLogout: () => void;
}> = ({ user, loading, error, onLogout }) => {
  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  if (loading) {
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
            userName={user?.fullName}
            pageName='Profile'
            onLogout={onLogout}
          />
          <div className="w-full flex justify-center py-20">
            <div className="animate-pulse text-muted-foreground text-sm">Loading profile...</div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
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
            userName={user?.fullName}
            pageName='Profile'
            onLogout={onLogout}
          />
          <div className="w-full flex flex-col items-center gap-4 py-20">
            <div className="text-red-600 text-sm">Error: {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
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
            userName={user && typeof user === 'object' ? (user as UserWithRoles).fullName : undefined}
            pageName='Profile'
            onLogout={onLogout}
          />
          <div className="w-full flex flex-col items-center gap-4 py-20">
            <div className="text-muted-foreground text-sm">
              You are not authenticated or no user data returned.
            </div>
          </div>
        </div>
      </>
    );
  }

  const rolePanels = (user.roles ?? [])
    .map((r) => renderRolePanel(typeof r === 'string' ? r : r.name, user))
    .filter(Boolean);

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
          userName={user?.fullName}
          pageName='Profile'
          onLogout={onLogout}
        />
        <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
          <ProfileHeader user={user as UserWithRoles} />
          <Separator />
          {rolePanels.length > 0 && (
            <Card className="p-6 space-y-6">
              <div>{rolePanels}</div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

const ProfilePage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently, logout } = useAuth0();
  const { getMe } = useUserApi();

  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
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
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load profile');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, getAccessTokenSilently, getMe]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <LayoutProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <ProfileContent
          user={user}
          loading={loading}
          error={error}
          onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        />
      </div>
    </LayoutProvider>
  );
};

export default ProfilePage;