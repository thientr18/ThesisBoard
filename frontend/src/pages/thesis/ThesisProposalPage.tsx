import React, { useState, useEffect } from 'react';
import TeacherAvailableContent from '../../components/thesis/proposals/TeacherAvailableContent';
import ProposalSubmissionsContent from '../../components/thesis/proposals/ProposalSubmissionsContent';
import ThesisRegistrationsContent from '../../components/thesis/proposals/ThesisRegistrationsContent';
import { useUserApi } from '../../api/endpoints/user.api';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/common/feedback/LoadingSpinner';

const ThesisProposalPage: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const { getMe } = useUserApi();
  const [loading, setLoading] = useState(true);

  // Fetch user
  useEffect(() => {
    (async () => {
      const { data: userData } = await getMe();
      setUser(userData || null);
      setLoading(false);
    })();
  }, [getMe]);
  
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (
    user &&
    Array.isArray(user.roles) &&
    user.roles.some((r: any) => r.name === 'student')
  ) {
    return <TeacherAvailableContent user={user} />;
  }

  if (
    user &&
    Array.isArray(user.roles) &&
    user.roles.some((r: any) => r.name === 'teacher')
  ) {
    return <ProposalSubmissionsContent user={user} />;
  }

  
  if (
    user &&
    Array.isArray(user.roles) &&
    user.roles.some((r: any) => r.name === 'admin' || r.name === 'moderator')
  ) {
    return <ThesisRegistrationsContent user={user} />;
  }

  return <Navigate to="/not-found" replace />;
};

export default ThesisProposalPage;