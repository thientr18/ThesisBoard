import { useAuthenticatedApi } from '../config';
import type { 
  ApiResponse, 
  Notification, 
  NotificationCount, 
  CreateNotificationRequest, 
  UpdateNotificationRequest 
} from '../../types/notification.types';

export const NotificationAPI = {
  /**
   * Get all notifications for the current user
   */
  getAll: async (): Promise<ApiResponse<Notification[]>> => {
    const authApi = useAuthenticatedApi();
    try {
      const response = await authApi.get('/api/notifications');
      return { data: response.data as Notification[], error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch notifications' 
      };
    }
  },

  /**
   * Get notification by ID
   */
  getById: async (id: string): Promise<ApiResponse<Notification>> => {
    const authApi = useAuthenticatedApi();
    try {
      const response = await authApi.get(`/api/notifications/${id}`);
      return { data: response.data as Notification, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch notification' 
      };
    }
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<ApiResponse<NotificationCount>> => {
    const authApi = useAuthenticatedApi();
    try {
      const response = await authApi.get('/api/notifications/unread/count');
      return { data: response.data as NotificationCount, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch unread count' 
      };
    }
  },

  /**
   * Create a new notification with optional file attachment
   */
  create: async (data: CreateNotificationRequest): Promise<ApiResponse<Notification>> => {
    const authApi = useAuthenticatedApi();
    try {
      // If there's a file attachment, use FormData
      if (data.attachment) {
        const formData = new FormData();
        formData.append('message', data.message);
        formData.append('type', data.type);
        if (data.userId) formData.append('userId', data.userId);
        if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));
        formData.append('attachment', data.attachment);

        const response = await authApi.post('/api/notifications', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return { data: response.data as Notification, error: null };
      } else {
        // No file attachment, send as JSON
        const response = await authApi.post('/api/notifications', data);
        return { data: response.data as Notification, error: null };
      }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to create notification' 
      };
    }
  },

  /**
   * Update a notification
   */
  update: async (id: string, payload: UpdateNotificationRequest): Promise<ApiResponse<Notification>> => {
    const authApi = useAuthenticatedApi();
    try {
      const response = await authApi.put(`/api/notifications/${id}`, payload);
      return { data: response.data as Notification, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to update notification' 
      };
    }
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    const authApi = useAuthenticatedApi();
    try {
      const response = await authApi.patch(`/api/notifications/${id}/read`);
      return { data: response.data as Notification, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to mark notification as read' 
      };
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const authApi = useAuthenticatedApi();
    try {
      await authApi.patch('/api/notifications/read-all');
      return { data: null, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to mark all notifications as read' 
      };
    }
  },

  /**
   * Delete a notification
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const authApi = useAuthenticatedApi();
    try {
      await authApi.delete(`/api/notifications/${id}`);
      return { data: null, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to delete notification' 
      };
    }
  },

  /**
   * Delete all notifications
   */
  deleteAll: async (): Promise<ApiResponse<void>> => {
    const authApi = useAuthenticatedApi();
    try {
      await authApi.delete('/api/notifications/all');
      return { data: null, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to delete all notifications' 
      };
    }
  }
};