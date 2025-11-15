import React from 'react';
import { Button } from 'antd';
import NotificationList from './NotificationList';
import type { Notification } from '../../types/notification.types';

interface NotificationPanelProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onMarkAllRead: () => void;
  onItemClick: (notification: Notification) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  loading,
  error,
  onRefresh,
  onMarkAllRead,
  onItemClick,
}) => {
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="w-80 max-h-96 flex flex-col">
      <div className="flex items-center justify-between px-2 py-1 border-b">
        <span className="font-semibold text-sm">Notifications</span>
        <div className="flex gap-2">
          <Button size="small" type="text" onClick={onRefresh} disabled={loading}>Refresh</Button>
          <Button
            size="small"
            type="text"
            onClick={onMarkAllRead}
            disabled={loading || safeNotifications.every(i => i.isRead)}
          >
            Mark All as Read
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <NotificationList
          notifications={safeNotifications}
          loading={loading}
          error={error}
          onItemClick={onItemClick}
        />
      </div>
      <div className="border-t p-2">
        <Button block size="small" onClick={() => (window.location.href = "/notifications")}>
          View All
        </Button>
      </div>
    </div>
  );
};

export default NotificationPanel;