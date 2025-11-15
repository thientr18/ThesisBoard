import { useEffect, useState } from 'react';
import Carousel from '../common/feedback/Carousel';
import LoadingSpinner from '../common/feedback/LoadingSpinner';
import EmptyState from '../common/feedback/EmptyState';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import AnnouncementCard from './AnnouncementCard';
import { useAnnouncementApi } from '../../api/endpoints/announcement.api';
import type { Announcement } from '../../types/announcement.types';

type Props = {
  autoPlayInterval?: number;
  onSelect?: (announcement: Announcement) => void;
  refreshKey?: number;
};

export default function AnnouncementPinnedSlider({ autoPlayInterval = 5000, onSelect, refreshKey }: Props) {
  const { getPinned } = useAnnouncementApi();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPinnedAnnouncements = async () => {
      setLoading(true);
      try {
        const { data, error } = await getPinned();

        if (error) {
          console.error('Failed to load pinned announcements:', error);
          setAnnouncements([]);
        } else {
          setAnnouncements(data || []);
        }
      } catch (err) {
        console.error('Error loading pinned announcements:', err);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    loadPinnedAnnouncements();
  }, [getPinned, refreshKey]);

  if (loading) {
    return (
      <LoadingSpinner size="large" className="py-12" />
    );
  }

  if (announcements.length === 0) {
    return (
      <EmptyState
        title="No pinned announcements"
        className="py-12"
      />
    );
  }

  return (
    <div className="relative px-14">
      <Carousel
        autoplay
        autoplaySpeed={autoPlayInterval}
        showArrows={true}
        showDots={true}
        className="pinned-announcement-slider"
      >
        {announcements.map((announcement) => (
          <div key={announcement.id} className="mb-3">
            <AnnouncementCard
              announcement={announcement}
              onClick={onSelect}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}