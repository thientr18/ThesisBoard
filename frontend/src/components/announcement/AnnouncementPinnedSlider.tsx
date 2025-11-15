import { useEffect, useState } from 'react';
import { Carousel, Spin, Empty } from 'antd';
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
      <div className="flex justify-center items-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <Empty
        description="No pinned announcements"
        className="py-12"
      />
    );
  }

  const ArrowButton = ({ direction, onClick }: { direction: 'left' | 'right'; onClick?: () => void }) => (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 ${
        direction === 'left' ? '-left-12' : '-right-12'
      } z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[#189ad6] hover:text-white transition-all duration-200 border border-gray-200`}
    >
      {direction === 'left' ? <LeftOutlined /> : <RightOutlined />}
    </button>
  );

  return (
    <div className="relative px-14">
      <Carousel
        autoplay
        autoplaySpeed={autoPlayInterval}
        dots={{
          className: 'custom-dots'
        }}
        arrows
        prevArrow={<ArrowButton direction="left" />}
        nextArrow={<ArrowButton direction="right" />}
        className="pinned-announcement-slider"
      >
        {announcements.map((announcement) => (
          <div key={announcement.id} className="px-2">
            <AnnouncementCard
              announcement={announcement}
              onClick={onSelect}
            />
          </div>
        ))}
      </Carousel>

      <style>{`
        .pinned-announcement-slider .slick-dots {
          bottom: -32px;
        }
        
        .pinned-announcement-slider .slick-dots li button {
          background: #cbd5e1;
          border-radius: 50%;
          opacity: 0.8;
          transition: all 0.3s ease;
        }
        
        .pinned-announcement-slider .slick-dots li button:hover {
          opacity: 1;
          background: #94a3b8;
        }
        
        .pinned-announcement-slider .slick-dots li.slick-active button {
          background: #2f398f;
          opacity: 1;
        }
        
        .pinned-announcement-slider .slick-slide > div {
          padding: 0 4px;
        }
      `}</style>
    </div>
  );
}