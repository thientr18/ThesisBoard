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

export const useAnnouncementApi = () => {
  const authApi = useAuthenticatedApi();

  const getAll = useCallback(async (): Promise<ApiResponse<Announcement[]>> => {
    try {
      const res = await authApi.get<ServerResponse<AnnouncementDTO[]>>(BASE_PATH);
      const dtos = res.data?.data ?? [];
      const data = Array.isArray(dtos) ? dtos.map(mapAnnouncement) : [];
      return { data, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
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
      return { data: null, error: handleApiError(e) };
    }
  }, [authApi]);

  const getPublicSlides = useCallback(async (): Promise<ApiResponse<Announcement[]>> => {
    try {
      const res = await authApi.get<ServerResponse<AnnouncementDTO[]>>(`${BASE_PATH}/public`);
      const dtos = res.data?.data ?? [];
      const data = Array.isArray(dtos) ? dtos.map(mapAnnouncement) : [];
      return { data, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [authApi]);

  const getById = useCallback(async (id: number): Promise<ApiResponse<Announcement>> => {
    try {
      const res = await authApi.get<ServerResponse<AnnouncementDTO>>(`${BASE_PATH}/${id}`);
      const dto = res.data?.data;
      return dto ? { data: mapAnnouncement(dto), error: null } : { data: null, error: 'Not found' };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [authApi]);

  const create = useCallback(async (payload: CreateAnnouncementRequest): Promise<ApiResponse<Announcement>> => {
    try {
      const res = await authApi.post<ServerResponse<AnnouncementDTO>>(BASE_PATH, payload);
      const dto = res.data?.data;
      return dto ? { data: mapAnnouncement(dto), error: null } : { data: null, error: 'Invalid response' };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [authApi]);

  const update = useCallback(async (id: number, payload: UpdateAnnouncementRequest): Promise<ApiResponse<Announcement>> => {
    try {
      const res = await authApi.put<ServerResponse<AnnouncementDTO>>(`${BASE_PATH}/${id}`, payload);
      const dto = res.data?.data;
      return dto ? { data: mapAnnouncement(dto), error: null } : { data: null, error: 'Invalid response' };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [authApi]);

  const deleteOne = useCallback(async (id: number): Promise<ApiResponse<void>> => {
    try {
      await authApi.delete(`${BASE_PATH}/${id}`);
      return { data: null, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [authApi]);

  const getAllCount = useCallback(async (): Promise<ApiResponse<number>> => {
    try {
      const res = await authApi.get<ServerResponse<number>>(`${BASE_PATH}/stats/count`);
      const count = res.data?.data ?? 0;
      return { data: count, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [authApi]);

  const getPinnedCount = useCallback(async (): Promise<ApiResponse<number>> => {
    try {
      const res = await authApi.get<ServerResponse<number>>(`${BASE_PATH}/stats/pinned/count`);
      const count = res.data?.data ?? 0;
      return { data: count, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [authApi]);

  const getWeeklyCount = useCallback(async (): Promise<ApiResponse<number>> => {
    try {
      const res = await authApi.get<ServerResponse<number>>(`${BASE_PATH}/stats/weekly/count`);
      const count = res.data?.data ?? 0;
      return { data: count, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
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