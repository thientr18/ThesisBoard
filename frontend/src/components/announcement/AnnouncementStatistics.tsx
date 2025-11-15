import { useEffect, useState } from 'react';
import { BellOutlined, PushpinOutlined, CalendarOutlined } from '@ant-design/icons';
import Card from '../common/display/Card';
import { Text } from '../common/display/Typography';
import { LoadingSpinner } from '../common/feedback/LoadingSpinner';
import { useAnnouncementApi } from '../../api/endpoints/announcement.api';

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
};

const StatCard = ({ title, value, icon, color, loading }: StatCardProps) => {
  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Text className="text-gray-500 text-sm mb-2 font-['Open_Sans']">
            {title}
          </Text>
          {loading ? (
            <LoadingSpinner size="small" />
          ) : (
            <div className="text-3xl font-bold font-['Montserrat']" style={{ color }}>
              {value.toLocaleString()}
            </div>
          )}
        </div>
        <div 
          className="flex items-center justify-center w-16 h-16 rounded-full bg-opacity-10"
          style={{ backgroundColor: `${color}20` }}
        >
          <span className="text-3xl" style={{ color }}>
            {icon}
          </span>
        </div>
      </div>
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: color }}
      />
    </Card>
  );
};

type Props = {
  refreshKey?: number;
};

export default function AnnouncementStatistics({ refreshKey = 0 }: Props) {
  const { getAllCount, getWeeklyCount, getPinnedCount } = useAnnouncementApi();
  
  const [totalCount, setTotalCount] = useState<number>(0);
  const [weeklyCount, setWeeklyCount] = useState<number>(0);
  const [pinnedCount, setPinnedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        const [totalRes, weeklyRes, pinnedRes] = await Promise.all([
          getAllCount(),
          getWeeklyCount(),
          getPinnedCount()
        ]);

        if (totalRes.data !== null) setTotalCount(totalRes.data);
        if (weeklyRes.data !== null) setWeeklyCount(weeklyRes.data);
        if (pinnedRes.data !== null) setPinnedCount(pinnedRes.data);

        if (totalRes.error) console.error('Failed to fetch total count:', totalRes.error);
        if (weeklyRes.error) console.error('Failed to fetch weekly count:', weeklyRes.error);
        if (pinnedRes.error) console.error('Failed to fetch pinned count:', pinnedRes.error);
      } catch (err) {
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [getAllCount, getWeeklyCount, getPinnedCount, refreshKey]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Announcements"
        value={totalCount}
        icon={<BellOutlined />}
        color="#189ad6"
        loading={loading}
      />
      <StatCard
        title="This Week"
        value={weeklyCount}
        icon={<CalendarOutlined />}
        color="#2f398f"
        loading={loading}
      />
      <StatCard
        title="Pinned"
        value={pinnedCount}
        icon={<PushpinOutlined />}
        color="#52c41a"
        loading={loading}
      />
    </div>
  );
}