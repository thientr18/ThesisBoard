import React, { useState, useEffect } from 'react';
import TopicPageContentTeacher from '../../components/pre-thesis/topicTeacher/TopicContentTeacher';
import TopicPageContent from '../../components/pre-thesis/topic/TopicContent';
import { useUserApi } from '../../api/endpoints/user.api';

const TopicPage: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const { getMe } = useUserApi();

  // Fetch user
  useEffect(() => {
    (async () => {
      const { data: userData } = await getMe();
      setUser(userData || null);
    })();
  }, [getMe]);
  
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