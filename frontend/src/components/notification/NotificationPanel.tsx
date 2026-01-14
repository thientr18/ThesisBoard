import React, { useState } from "react";
import NotificationList from "./NotificationList";
import type { Notification } from "../../types/notification.types";
import { Button, Spin, Alert } from "antd";

interface NotificationPanelProps {
  notifications: Notification[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onMarkAllRead?: () => void;
  onItemClick?: (notification: Notification) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  loading,
  error,
  onRefresh,
  onMarkAllRead,
  onItemClick,
}) => {
  const [dismissed, setDismissed] = useState<number[]>([]);

  const handleDismiss = (id: number) => {
    setDismissed(prev => [...prev, id]);
  };

  const visibleNotifications = notifications
    .filter(n => !dismissed.includes(n.id))
    .sort((a, b) => {
        if (a.isRead === b.isRead) {
        return 0;
      }
      return a.isRead ? 1 : -1;
    });

  return (
    <div className="w-[350px] max-h-[500px] flex flex-col gap-3 p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-lg">Notifications</span>
        <div className="flex gap-2">
          <Button size="small" onClick={onRefresh}>Refresh</Button>
          <Button size="small" type="primary" onClick={onMarkAllRead}>Mark all as read</Button>
        </div>
      </div>
      {error && <Alert type="error" message={error} showIcon />}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spin />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-[410px]">
          <NotificationList
            notifications={visibleNotifications}
            onDismiss={handleDismiss}
            onItemClick={onItemClick}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;