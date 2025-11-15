import React from 'react';
import { List, Empty, Spin } from 'antd';
import type { Notification } from '../../types/notification.types';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  error?: string | null;
  onItemClick?: (notification: Notification) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  error,
  onItemClick,
}) => {
  if (loading) {
    return <div className="flex justify-center items-center h-40"><Spin size="small" /></div>;
  }
  if (error) {
    return <div className="p-4 text-red-500 text-sm">{error}</div>;
  }
  if (notifications.length === 0) {
    return <Empty description="Không có thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }
  return (
    <List
      dataSource={notifications}
      renderItem={(n) => <NotificationItem notification={n} onClick={onItemClick} />}
    />
  );
};

export default NotificationList;