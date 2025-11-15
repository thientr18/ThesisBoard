import React from 'react';
import type { Notification } from '../../types/notification.types';
import { List, Typography } from 'antd';

interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => (
  <List.Item
    onClick={() => onClick?.(notification)}
    className={`cursor-pointer px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded ${
      notification.isRead ? "opacity-70" : "bg-blue-50 dark:bg-blue-900/30"
    }`}
  >
    <div className="flex flex-col w-full">
      <Typography.Text strong className="text-xs">{notification.type}</Typography.Text>
      <Typography.Text className="text-sm line-clamp-2">{notification.message}</Typography.Text>
      {notification.createdAt && (
        <Typography.Text type="secondary" className="text-[10px] mt-0.5">
          {new Date(notification.createdAt).toLocaleString()}
        </Typography.Text>
      )}
    </div>
  </List.Item>
);

export default NotificationItem;