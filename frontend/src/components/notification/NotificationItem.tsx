import React from "react";
import { CloseOutlined } from "@ant-design/icons";
import type { Notification } from "../../types/notification.types";
import clsx from "clsx";

interface NotificationItemProps {
  notification: Notification;
  onDismiss?: (id: number) => void;
  onClick?: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDismiss,
  onClick,
}) => {
  return (
    <div
      className={clsx(
        "relative flex flex-col gap-1 p-3 rounded-lg border shadow-sm transition-all cursor-pointer box-border",
        notification.isRead
          ? "bg-white border-gray-300"
          : "bg-[#e6f7ff] border-[#189ad6]"
      )}
      onClick={() => onClick?.(notification)}
    >
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
        onClick={e => {
          e.stopPropagation();
          onDismiss?.(notification.id);
        }}
        aria-label="Dismiss"
      >
        <CloseOutlined />
      </button>
      <div className="font-semibold text-base">{notification.title}</div>
      <div className="text-sm text-gray-700">{notification.content}</div>
      <div className="text-xs text-gray-400 mt-1">
        {new Date(notification.createdAt).toLocaleString()}
      </div>
    </div>
  );
};

export default NotificationItem;