import React, { useState, useEffect } from 'react';
import ApplicationContent from '../../components/pre-thesis/application/ApplicationContent';
import { useUserApi } from '../../api/endpoints/user.api';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/feedback/LoadingSpinner';

const ApplicationPage: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { getMe } = useUserApi();

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await getMe();
        setUser(userData || null);
      } finally {
        setLoading(false);
      }
    })();
  }, [getMe]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (
    user &&
    Array.isArray(user.roles) &&
    user.roles.some((r: any) => r.name === 'teacher')
  ) {
    return <ApplicationContent user={user} />;
  }
  
  return <Navigate to="/forbidden" replace />;
};

export default ApplicationPage;