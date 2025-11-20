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

  // GET /api/semesters
  const getAll = useCallback(async (): Promise<ApiResponse<Semester[]>> => {
    try {
      const res = await authApi.get(BASE_PATH);
      return { data: res.data as Semester[], error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch semesters' };
    }
  }, [authApi]);

  // GET /api/semesters/:id
  const getById = useCallback(async (id: number): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/${id}`);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch semester' };
    }
  }, [authApi]);

  // POST /api/semesters
  const create = useCallback(async (payload: CreateSemesterRequest | FormData): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.post(BASE_PATH, payload);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to create semester' };
    }
  }, [authApi]);

  // PUT /api/semesters/:id
  const update = useCallback(async (id: number, payload: UpdateSemesterRequest): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.put(`${BASE_PATH}/${id}`, payload);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to update semester' };
    }
  }, [authApi]);

  // DELETE /api/semesters/:id
  const deleteOne = useCallback(async (id: number): Promise<ApiResponse<boolean>> => {
    try {
      await authApi.delete(`${BASE_PATH}/${id}`);
      return { data: true, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to delete semester' };
    }
  }, [authApi]);

  // GET /api/semesters/current
  const getCurrent = useCallback(async (): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/current`);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch current semester' };
    }
  }, [authApi]);

  // POST /api/semesters/current/:id
  const setCurrent = useCallback(async (id: number): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.post(`${BASE_PATH}/current/${id}`);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to set current semester' };
    }
  }, [authApi]);

  // PATCH /api/semesters/unset-current/:id
  const unsetCurrent = useCallback(async (id: number): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.patch(`${BASE_PATH}/unset-current/${id}`);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to unset current semester' };
    }
  }, [authApi]);

  // GET /api/semesters/active
  const getActive = useCallback(async (): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/active`);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch active semester' };
    }
  }, [authApi]);

  // POST /api/semesters/active/:id
  const setActive = useCallback(async (id: number): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.post(`${BASE_PATH}/active/${id}`);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to set active semester' };
    }
  }, [authApi]);

  // PATCH /api/semesters/unset-active/:id
  const unsetActive = useCallback(async (id: number): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.patch(`${BASE_PATH}/unset-active/${id}`);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to unset active semester' };
    }
  }, [authApi]);

  // get Student Semesters data
  const getSemesterForStudent = useCallback(async (studentId: number) => {
    try {
      const res = await authApi.get(`${BASE_PATH}/student-semesters/${studentId}`);
      return { data: res.data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch semesters for student' };
    }
  }, [authApi]);

  // Attachments
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
    getCurrent,
    setCurrent,
    unsetCurrent,
    getActive,
    setActive,
    unsetActive,
    getSemesterForStudent,
    addAttachment,
    addExternalAttachment,
    removeAttachment
  }), [
    getAll,
    getById,
    create,
    update,
    deleteOne,
    getCurrent,
    setCurrent,
    unsetCurrent,
    getActive,
    setActive,
    unsetActive,
    getSemesterForStudent,
    addAttachment,
    addExternalAttachment,
    removeAttachment
  ]);
};