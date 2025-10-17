export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  userId: string;
  metadata?: Record<string, any>;
}

export type NotificationType = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';

export const NotificationTypes = {
  INFO: 'INFO' as NotificationType,
  WARNING: 'WARNING' as NotificationType,
  ERROR: 'ERROR' as NotificationType,
  SUCCESS: 'SUCCESS' as NotificationType
};

export interface NotificationCount {
  count: number;
}

export interface CreateNotificationRequest {
  message: string;
  type: NotificationType;
  userId?: string;
  metadata?: Record<string, any>;
  attachment?: File;
}

export interface UpdateNotificationRequest {
  isRead?: boolean;
  message?: string;
  metadata?: Record<string, any>;
}