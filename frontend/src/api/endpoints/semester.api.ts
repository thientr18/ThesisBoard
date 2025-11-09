import { useAuthenticatedApi } from '../config';
import { useCallback, useMemo } from 'react';
import type {
  ApiResponse,
  Semester,
  CreateSemesterRequest,
  UpdateSemesterRequest,
  SemesterAttachment
} from '../../types/semester.types';

const BASE_PATH = '/api/semesters';

export const useSemesterApi = () => {
  const authApi = useAuthenticatedApi();

  const getAll = useCallback(async (): Promise<ApiResponse<Semester[]>> => {
    try {
      const res = await authApi.get(BASE_PATH);
      return { data: res.data as Semester[], error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch semesters' };
    }
  }, [authApi]);

  const getById = useCallback(async (id: number): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/${id}`);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch semester' };
    }
  }, [authApi]);

  const create = useCallback(async (payload: CreateSemesterRequest | FormData): Promise<ApiResponse<Semester>> => {
    try {
      // Nếu là FormData (có file) thì để browser tự set boundary
      const res = await authApi.post(BASE_PATH, payload);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to create semester' };
    }
  }, [authApi]);

  const update = useCallback(async (id: number, payload: UpdateSemesterRequest): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.put(`${BASE_PATH}/${id}`, payload);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to update semester' };
    }
  }, [authApi]);

  const deleteOne = useCallback(async (id: number): Promise<ApiResponse<boolean>> => {
    try {
      await authApi.delete(`${BASE_PATH}/${id}`);
      return { data: true, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to delete semester' };
    }
  }, [authApi]);

  const addAttachment = useCallback(async (
    semesterId: number,
    file: File
  ): Promise<ApiResponse<SemesterAttachment>> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await authApi.post(`${BASE_PATH}/${semesterId}/attachments`, formData);
      return { data: res.data as SemesterAttachment, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to add attachment' };
    }
  }, [authApi]);

  const addExternalAttachment = useCallback(async (
    semesterId: number,
    attachment: { name: string; url: string; type: string }
  ): Promise<ApiResponse<SemesterAttachment>> => {
    try {
      const res = await authApi.post(`${BASE_PATH}/${semesterId}/attachments/external`, attachment);
      return { data: res.data as SemesterAttachment, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to add external attachment' };
    }
  }, [authApi]);

  const removeAttachment = useCallback(async (
    semesterId: number,
    attachmentId: number
  ): Promise<ApiResponse<boolean>> => {
    try {
      await authApi.delete(`${BASE_PATH}/${semesterId}/attachments/${attachmentId}`);
      return { data: true, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to remove attachment' };
    }
  }, [authApi]);

  return useMemo(() => ({
    getAll,
    getById,
    create,
    update,
    delete: deleteOne,
    addAttachment,
    addExternalAttachment,
    removeAttachment
  }), [
    getAll,
    getById,
    create,
    update,
    deleteOne,
    addAttachment,
    addExternalAttachment,
    removeAttachment
  ]);
};