import { useAuthenticatedApi } from '../config';
import { useCallback, useMemo } from 'react';
import type {
  ApiResponse,
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest
} from '../../types/announcement.types';

const BASE_PATH = '/api/announcements';

export const useAnnouncementApi = () => {
  const authApi = useAuthenticatedApi();

  const getAll = useCallback(async (): Promise<ApiResponse<Announcement[]>> => {
    try {
      const res = await authApi.get(BASE_PATH);
      return { data: res.data as Announcement[], error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch announcements' };
    }
  }, [authApi]);

  const getSlides = useCallback(async (): Promise<ApiResponse<Announcement[]>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/slide`);
      return { data: res.data as Announcement[], error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch slides' };
    }
  }, [authApi]);

  const getPublicSlides = useCallback(async (): Promise<ApiResponse<Announcement[]>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/public`);
      return { data: res.data as Announcement[], error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch public slides' };
    }
  }, [authApi]);

  const getById = useCallback(async (id: number): Promise<ApiResponse<Announcement>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/${id}`);
      return { data: res.data as Announcement, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch announcement' };
    }
  }, [authApi]);

  const create = useCallback(async (payload: CreateAnnouncementRequest): Promise<ApiResponse<Announcement>> => {
    try {
      const res = await authApi.post(BASE_PATH, payload);
      return { data: res.data as Announcement, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to create announcement' };
    }
  }, [authApi]);

  const update = useCallback(async (id: number, payload: UpdateAnnouncementRequest): Promise<ApiResponse<Announcement>> => {
    try {
      const res = await authApi.put(`${BASE_PATH}/${id}`, payload);
      return { data: res.data as Announcement, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to update announcement' };
    }
  }, [authApi]);

  const deleteOne = useCallback(async (id: number): Promise<ApiResponse<void>> => {
    try {
      await authApi.delete(`${BASE_PATH}/${id}`);
      return { data: null, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to delete announcement' };
    }
  }, [authApi]);

  return useMemo(() => ({
    getAll,
    getSlides,
    getPublicSlides,
    getById,
    create,
    update,
    delete: deleteOne,
  }), [
    getAll,
    getSlides,
    getPublicSlides,
    getById,
    create,
    update,
    deleteOne
  ]);
};