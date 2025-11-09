import { useEffect, useState } from 'react';
import { useNotificationAPI } from '../api/endpoints/notification.api';

export const useUnreadNotifications = () => {
  const { getUnreadCount } = useNotificationAPI();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const res = await getUnreadCount();
    if (res.error) setError(res.error);
    else setCount(res.data?.count ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [getUnreadCount]);

  return { count, loading, error, refresh };
};