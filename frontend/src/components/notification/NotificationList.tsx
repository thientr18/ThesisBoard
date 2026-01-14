import React from "react";
import NotificationItem from "./NotificationItem";
import type { Notification } from "../../types/notification.types";

interface NotificationListProps {
  notifications: Notification[];
  onDismiss?: (id: number) => void;
  onItemClick?: (notification: Notification) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onDismiss,
  onItemClick,
}) => {
  if (!notifications.length) {
    return (
      <div className="py-8 text-center text-gray-400">No notifications</div>
    );
  }
  return (
    <div className="flex flex-col gap-3 px-1">
      {notifications.map(n => (
        <NotificationItem
          key={n.id}
          notification={n}
          onDismiss={onDismiss}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
};

export default NotificationList;