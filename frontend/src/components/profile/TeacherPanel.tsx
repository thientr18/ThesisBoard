import React, { useEffect, useState, useCallback } from 'react';import { useAuth0 } from '@auth0/auth0-react';
import { useUserApi } from '../../api/endpoints/user.api';
import type { Teacher, UserWithRoles } from '../../types/user.types';
import Label from '../common/display/Label';

interface TeacherProps {
  user: UserWithRoles;
}

const InfoRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
    <Label className="text-xs uppercase tracking-wide text-muted-foreground w-32">{label}</Label>
    <div className="text-sm font-medium break-all">{value || '—'}</div>
  </div>
);


const TeacherPanel: React.FC<TeacherProps> = ({ user }) => {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();
  const { getTeacherById } = useUserApi();

  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeacherDetails = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!isAuthenticated) {
      setTeacherDetails(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await getAccessTokenSilently();
      const { data, error } = await getTeacherById(user.id);
      console.log("Teacher details fetched:", data, error);
      if (error) {
        setError(error);
        setTeacherDetails(null);
      } else {
        setTeacherDetails(data as Teacher ?? null);
        console.log("Teacher details set in state:", data);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load profile');
      setTeacherDetails(null);
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, getAccessTokenSilently, getTeacherById]);
  useEffect(() => {
    loadTeacherDetails();
  }, [loadTeacherDetails]);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="animate-pulse text-muted-foreground text-sm">Loading student details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center gap-4 py-20">
        <div className="text-red-500 text-sm">Error: {error}</div>
        <button 
          onClick={loadTeacherDetails}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!teacherDetails) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="text-muted-foreground text-sm">
          {isAuthenticated ? 'No teacher details available.' : 'You are not authenticated.'}
        </div>
        {isAuthenticated && (
          <button 
            onClick={loadTeacherDetails}
            className="btn btn-primary"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <InfoRow label="Teacher Code" value={teacherDetails.teacherCode} />
      <InfoRow label="Teacher Code" value={teacherDetails.title} />
      <InfoRow label="Teacher Code" value={teacherDetails.office} />
      <InfoRow label="Teacher Code" value={teacherDetails.phone} />
    </div>
  );
};

export default TeacherPanel;