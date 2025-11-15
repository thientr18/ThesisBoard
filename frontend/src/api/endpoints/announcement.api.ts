import { useAuthenticatedApi } from '../config';
import { useCallback, useMemo } from 'react';
import type {
  ApiResponse,
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest
} from '../../types/announcement.types';
import { mapAnnouncement } from '../../types/announcement.types';
import type { AnnouncementDTO } from '../../types/announcement.types';

const BASE_PATH = '/api/announcements';

// Shape returned by backend controllers
type ServerResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};

export const useAnnouncementApi = () => {
  const authApi = useAuthenticatedApi();

  const getAll = useCallback(async (): Promise<ApiResponse<Announcement[]>> => {
    try {
      const res = await authApi.get<ServerResponse<AnnouncementDTO[]>>(BASE_PATH);
      const dtos = res.data?.data ?? [];
      const data = Array.isArray(dtos) ? dtos.map(mapAnnouncement) : [];
      return { data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch announcements' };
    }
  }, [authApi]);

  // Accept optional pagination params to leverage server-side paging
  const getSlides = useCallback(
    async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Announcement[]>> => {
      try {
        const res = await authApi.get<ServerResponse<AnnouncementDTO[]>>(
          `${BASE_PATH}/slide`,
          { params }
        );
        const dtos = res.data?.data ?? [];
        const data = Array.isArray(dtos) ? dtos.map(mapAnnouncement) : [];
        return { data, error: null };
      } catch (e) {
        return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch slides' };
      }
    },
    [authApi]
  );

  const getPinned = useCallback(async (): Promise<ApiResponse<Announcement[]>> => {
    try {
      const res = await authApi.get<ServerResponse<AnnouncementDTO[]>>(`${BASE_PATH}/pinned`);
      const dtos = res.data?.data ?? [];
      const data = Array.isArray(dtos) ? dtos.map(mapAnnouncement) : [];
      return { data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch pinned announcements' };
    }
  }, [authApi]);

  const getPublicSlides = useCallback(async (): Promise<ApiResponse<Announcement[]>> => {
    try {
      const res = await authApi.get<ServerResponse<AnnouncementDTO[]>>(`${BASE_PATH}/public`);
      const dtos = res.data?.data ?? [];
      const data = Array.isArray(dtos) ? dtos.map(mapAnnouncement) : [];
      return { data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch public slides' };
    }
  }, [authApi]);

  const getById = useCallback(async (id: number): Promise<ApiResponse<Announcement>> => {
    try {
      const res = await authApi.get<ServerResponse<AnnouncementDTO>>(`${BASE_PATH}/${id}`);
      const dto = res.data?.data;
      return dto ? { data: mapAnnouncement(dto), error: null } : { data: null, error: 'Not found' };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch announcement' };
    }
  }, [authApi]);

  const create = useCallback(async (payload: CreateAnnouncementRequest): Promise<ApiResponse<Announcement>> => {
    try {
      const res = await authApi.post<ServerResponse<AnnouncementDTO>>(BASE_PATH, payload);
      const dto = res.data?.data;
      return dto ? { data: mapAnnouncement(dto), error: null } : { data: null, error: 'Invalid response' };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to create announcement' };
    }
  }, [authApi]);

  const update = useCallback(async (id: number, payload: UpdateAnnouncementRequest): Promise<ApiResponse<Announcement>> => {
    try {
      const res = await authApi.put<ServerResponse<AnnouncementDTO>>(`${BASE_PATH}/${id}`, payload);
      const dto = res.data?.data;
      return dto ? { data: mapAnnouncement(dto), error: null } : { data: null, error: 'Invalid response' };
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

  const getAllCount = useCallback(async (): Promise<ApiResponse<number>> => {
    try {
      const res = await authApi.get<ServerResponse<number>>(`${BASE_PATH}/stats/count`);
      const count = res.data?.data ?? 0;
      return { data: count, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch announcement count' };
    }
  }, [authApi]);

  const getPinnedCount = useCallback(async (): Promise<ApiResponse<number>> => {
    try {
      const res = await authApi.get<ServerResponse<number>>(`${BASE_PATH}/stats/pinned/count`);
      const count = res.data?.data ?? 0;
      return { data: count, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch pinned announcement count' };
    }
  }, [authApi]);

  const getWeeklyCount = useCallback(async (): Promise<ApiResponse<number>> => {
    try {
      const res = await authApi.get<ServerResponse<number>>(`${BASE_PATH}/stats/weekly/count`);
      const count = res.data?.data ?? 0;
      return { data: count, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch weekly announcement count' };
    }
  }, [authApi]);

  return useMemo(() => ({
    getAll,
    getSlides,
    getPinned,
    getPublicSlides,
    getById,
    create,
    update,
    deleteOne,
    getAllCount,
    getPinnedCount,
    getWeeklyCount
  }), [
    getAll,
    getSlides,
    getPinned,
    getPublicSlides,
    getById,
    create,
    update,
    deleteOne,
    getAllCount,
    getPinnedCount,
    getWeeklyCount
  ]);
};