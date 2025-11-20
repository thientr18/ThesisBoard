import React, { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useSemesterApi } from '../../api/endpoints/semester.api';
import type { UserWithRoles } from '../../types/user.types';
import Label from '../common/display/Label';
import Card from '../common/display/Card';

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
  const { getSemesterForStudent } = useSemesterApi();

  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudentSemesters = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!isAuthenticated) {
      setSemesters([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await getAccessTokenSilently();
      const { data, error } = await getSemesterForStudent(user.id);
      if (error) {
        let errorMsg = 'Unknown error';
        if (typeof error === 'string') errorMsg = error;
        setError(errorMsg);
        setSemesters([]);
      } else {
        setSemesters(Array.isArray(data) ? data : []);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load semesters');
      setSemesters([]);
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, getAccessTokenSilently, getSemesterForStudent, user.id]);

  useEffect(() => {
    loadStudentSemesters();
  }, [loadStudentSemesters]);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="animate-pulse text-muted-foreground text-sm">Loading student semesters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center gap-4 py-20">
        <div className="text-red-500 text-sm">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!semesters.length) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="text-muted-foreground text-sm">
          {isAuthenticated ? 'No semester data available.' : 'You are not authenticated.'}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {semesters.map((semesterItem: any) => (
        <Card key={semesterItem.id || semesterItem.semester?.id || Math.random()} className="p-4 space-y-2">
          <div className="font-bold text-lg mb-2">
            Semester: {semesterItem.semester?.name || semesterItem.semesterName || 'Unknown'}
          </div>
          <InfoRow label="Student ID" value={semesterItem.student?.studentIdCode} />
          <InfoRow label="Cohort Year" value={semesterItem.student?.cohortYear} />
          <InfoRow label="Class Name" value={semesterItem.student?.className} />
          <InfoRow label="Phone" value={semesterItem.student?.phone} />
          <InfoRow label="Date of Birth" value={semesterItem.student?.dob ? new Date(semesterItem.student.dob).toLocaleDateString() : '—'} />
          <InfoRow label="Gender" value={semesterItem.student?.gender} />
          <InfoRow label="GPA" value={semesterItem.gpa} />
          <InfoRow label="Credits" value={semesterItem.credits} />
          <InfoRow label="Status" value={semesterItem.status} />
        </Card>
      ))}
    </div>
  );
};

export default StudentPanel;