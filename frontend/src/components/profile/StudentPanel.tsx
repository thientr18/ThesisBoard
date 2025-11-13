import React, { useEffect, useState, useCallback } from 'react';import { useAuth0 } from '@auth0/auth0-react';
import { useUserApi } from '../../api/endpoints/user.api';
import type { StudentDetails, UserWithRoles } from '../../types/user.types';
import Label from '../common/display/Label';

interface StudentProps {
  user: UserWithRoles;
}

const InfoRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
    <Label className="text-xs uppercase tracking-wide text-muted-foreground w-32">{label}</Label>
    <div className="text-sm font-medium break-all">{value || '—'}</div>
  </div>
);

const StudentPanel: React.FC<StudentProps> = ({ user }) => {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();
  const { getStudentById } = useUserApi();

  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudentDetails = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!isAuthenticated) {
      setStudentDetails(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await getAccessTokenSilently();
      const { data, error } = await getStudentById(user.id);
      console.log("Student details fetched:", data, error);
      if (error) {
        setError(error);
        setStudentDetails(null);
      } else {
        setStudentDetails(data as StudentDetails ?? null);
        console.log("Student details set in state:", data);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load profile');
      setStudentDetails(null);
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, getAccessTokenSilently, getStudentById]);

  useEffect(() => {
    loadStudentDetails();
  }, [loadStudentDetails]);

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
          onClick={loadStudentDetails}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!studentDetails) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="text-muted-foreground text-sm">
          {isAuthenticated ? 'No student details available.' : 'You are not authenticated.'}
        </div>
        {isAuthenticated && (
          <button 
            onClick={loadStudentDetails}
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
      <InfoRow label="Student ID" value={studentDetails.studentId} />
      <InfoRow label="Cohort Year" value={studentDetails.cohortYear} />
      <InfoRow label="Class Name" value={studentDetails.className} />
      <InfoRow label="Phone" value={studentDetails.phone} />
      <InfoRow label="Date of Birth" value={studentDetails.dob ? new Date(studentDetails.dob).toLocaleDateString() : '—'} />
      <InfoRow label="Gender" value={studentDetails.gender} />
    </div>
  );
};

export default StudentPanel;