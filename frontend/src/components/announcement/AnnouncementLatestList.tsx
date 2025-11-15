import { useEffect, useState } from 'react';
import AnnouncementCard from './AnnouncementCard';
import { useAnnouncementApi } from '../../api/endpoints/announcement.api';
import { LoadingSpinner } from '../common/feedback/LoadingSpinner';
import { Alert } from '../common/feedback/Alert';
import { EmptyState } from '../common/feedback/EmptyState';
import type { Announcement } from '../../types/announcement.types';

type Props = {
  slidesOnly?: boolean;
  limit?: number;
  onSelect?: (a: Announcement) => void;
};

export default function AnnouncementLatestList({ slidesOnly = true, limit = 6, onSelect }: Props) {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useAnnouncementApi();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const run = async () => {
      const { data, error } = slidesOnly ? await api.getSlides() : await api.getAll();
      if (!mounted) return;

      if (error) {
        setError(error);
      } else {
        setItems((data ?? []).slice(0, limit));
      }
      setLoading(false);
    };

    run();
    return () => {
      mounted = false;
    };
  }, [api, slidesOnly, limit]);

  if (loading) {
    return <LoadingSpinner size="large" tip="Loading announcements..." />;
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Failed to load announcements"
        description={error}
        showIcon
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title="No announcements to display"
        description="There are currently no announcements available"
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((a) => (
        <AnnouncementCard 
          key={a.id} 
          announcement={a} 
          onClick={onSelect} 
        />
      ))}
    </div>
  );
}