import { ClockCircleOutlined, PushpinFilled } from '@ant-design/icons';
import Card from '../common/display/Card';
import Tag from '../common/display/Tag';
import { Text } from '../common/display/Typography';
import type { Announcement } from '../../types/announcement.types';

type Props = {
  announcement: Announcement;
  onClick?: (announcement: Announcement) => void;
  onEdit?: (announcement: Announcement) => void;
};

export default function AnnouncementCard({ announcement, onClick }: Props) {
  const date = new Date(announcement.createdAt).toLocaleDateString('eEn-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const truncatedContent = announcement.content.length > 150 
    ? announcement.content.substring(0, 150) + '...' 
    : announcement.content;

  const handleCardClick = () => {
    onClick?.(announcement);
  };

  return (
    <Card
      hoverable={!!onClick}
      onClick={handleCardClick}
      className="group transition-all duration-200 hover:shadow-md hover:border-[#189ad6]/30"
      bordered={true}
    >
      <div className="flex items-center gap-4 py-2">
        {/* Left: Pinned indicator and Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            {announcement.pinned && (
              <PushpinFilled className="text-[#189ad6] text-base mt-1 shrink-0" />
            )}
            <h3 className="text-base font-['Montserrat'] font-semibold text-gray-900 line-clamp-1 group-hover:text-[#189ad6] transition-colors">
              {announcement.title}
            </h3>
          </div>
          
          <Text className="text-sm text-gray-600 line-clamp-2 font-['Open_Sans'] mb-0!">
            {truncatedContent}
          </Text>
        </div>

        {/* Right: Date and Action buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Tag
            label={date}
            icon={<ClockCircleOutlined />}
            type="default"
            className="text-xs!"
            bordered={false}
          />
        </div>
      </div>

      {/* Accent line on hover */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-[#189ad6] to-[#2f398f] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Card>
  );
}