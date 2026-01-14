import { useAuthenticatedApi } from '../config';
import { useCallback, useMemo } from 'react';
import type {
  ApiResponse,
  Notification,
  NotificationCount,
  CreateNotificationRequest,
  UpdateNotificationRequest
} from '../../types/notification.types';

const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    const anyErr = error as any;
    if (anyErr?.response?.data) {
      const data = anyErr.response.data;
      if (data.message) {
        let msg = data.message;
        if (data.code) msg += ` (code: ${data.code})`;
        if (data.details) msg += `: ${JSON.stringify(data.details)}`;
        return msg;
      }
      return JSON.stringify(data);
    }
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Hook returning authenticated notification API methods.
 * Ensures hooks (useAuth0) are only called inside React hook/component trees.
 */
export const useNotificationAPI = () => {
  const authApi = useAuthenticatedApi();

  const getAll = useCallback(async (): Promise<ApiResponse<Notification[]>> => {
    try {
      const response = await authApi.get('/api/notifications');
      return { data: response.data?.data as Notification[], error: null };
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error)
      };
    }
  }, [authApi]);

  const getById = useCallback(async (id: string): Promise<ApiResponse<Notification>> => {
    try {
      const response = await authApi.get(`/api/notifications/${id}`);
      return { data: response.data?.data as Notification, error: null };
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error)
      };
    }
  }, [authApi]);

  const getUnreadCount = useCallback(async (): Promise<ApiResponse<NotificationCount>> => {
    try {
      const response = await authApi.get('/api/notifications/unread/count');
      return { data: response.data?.data as NotificationCount, error: null };
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error)
      };
    }
  }, [authApi]);

  const create = useCallback(async (data: CreateNotificationRequest): Promise<ApiResponse<Notification>> => {
    try {
      if (data.attachment) {
        const formData = new FormData();
        formData.append('message', data.message);
        formData.append('type', data.type);
        if (data.userId) formData.append('userId', data.userId);
        if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));
        formData.append('attachment', data.attachment);

        const response = await authApi.post('/api/notifications', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return { data: response.data?.data as Notification, error: null };
      } else {
        const response = await authApi.post('/api/notifications', data);
        return { data: response.data?.data as Notification, error: null };
      }
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error)
      };
    }
  }, [authApi]);

  const update = useCallback(async (id: string, payload: UpdateNotificationRequest): Promise<ApiResponse<Notification>> => {
    try {
      const response = await authApi.put(`/api/notifications/${id}`, payload);
      return { data: response.data?.data as Notification, error: null };
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error)
      };
    }
  }, [authApi]);

  const markAsRead = useCallback(async (id: string): Promise<ApiResponse<Notification>> => {
    try {
      const response = await authApi.patch(`/api/notifications/${id}/read`);
      return { data: response.data?.data as Notification, error: null };
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error)
      };
    }
  }, [authApi]);

  const markAllAsRead = useCallback(async (): Promise<ApiResponse<void>> => {
    try {
      await authApi.patch('/api/notifications/read-all');
      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error)
      };
    }
  }, [authApi]);

  const deleteOne = useCallback(async (id: string): Promise<ApiResponse<void>> => {
    try {
      await authApi.delete(`/api/notifications/${id}`);
      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error)
      };
    }
  }, [authApi]);

  const deleteAll = useCallback(async (): Promise<ApiResponse<void>> => {
    try {
      await authApi.delete('/api/notifications/all');
      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error)
      };
    }
  }, [authApi]);

  return useMemo(() => ({
    getAll,
    getById,
    getUnreadCount,
    create,
    update,
    markAsRead,
    markAllAsRead,
    delete: deleteOne,
    deleteAll,
  }), [
    getAll,
    getById,
    getUnreadCount,
    create,
    update,
    markAsRead,
    markAllAsRead,
    deleteOne,
    deleteAll
  ]);
};