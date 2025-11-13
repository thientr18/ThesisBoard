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
const ProfilePage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();
  const { getMe } = useUserApi();
  const { logout } = useAuth0();

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
      // Bảo đảm token được lấy trước (interceptor vẫn tự thêm header)
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

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="animate-pulse text-muted-foreground text-sm">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center gap-4 py-20">
        <div className="text-red-600 text-sm">Error: {error}</div>
        <button
          onClick={loadProfile}
          className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full flex flex-col items-center gap-4 py-20">
        <div className="text-muted-foreground text-sm">
          {isAuthenticated ? 'No user data returned.' : 'You are not authenticated.'}
        </div>
        {isAuthenticated && (
          <button
            onClick={loadProfile}
            className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Reload
          </button>
        )}
      </div>
    );
  }

  const rolePanels = (user.roles ?? [])
    .map((r) => renderRolePanel(typeof r === 'string' ? r : r.name, user))
    .filter(Boolean);

  return (
    <>
      <Navbar
        userName={user?.fullName}
        onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
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
    </>
  );
};

export default ProfilePage;