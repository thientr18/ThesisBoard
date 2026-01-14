import React, { useState, useEffect } from 'react';
import TopicPageContentTeacher from '../../components/pre-thesis/topicTeacher/TopicContentTeacher';
import TopicPageContent from '../../components/pre-thesis/topic/TopicContent';
import { useUserApi } from '../../api/endpoints/user.api';

const TopicPage: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { getMe } = useUserApi();

  // Fetch user
  useEffect(() => {
    (async () => {
      const { data: userData } = await getMe();
      setUser(userData || null);
      setLoading(false);
    })();
  }, [getMe]);
  
  if (loading) {
    return <div style={{ minHeight: 300, display: "flex", justifyContent: "center", alignItems: "center" }}><span>Loading...</span></div>;
  }

  if (
    user &&
    Array.isArray(user.roles) &&
    user.roles.some((r: any) => r.name === 'teacher')
  ) {
    return <TopicPageContentTeacher user={user} />;
  }

  return <TopicPageContent user={user} />;
};

export default TopicPage;