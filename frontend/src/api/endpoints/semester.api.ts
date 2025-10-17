import { useAuthenticatedApi } from '../config';
import type { 
  ApiResponse, 
  Semester, 
  CreateSemesterRequest,
  UpdateSemesterRequest, 
  SemesterAttachment 
} from '../../types/semester.types';

export const useSemesterApi = () => {
  const api = useAuthenticatedApi();

  // Get all semesters
  const getAll = async (): Promise<ApiResponse<Semester[]>> => {
    try {
      const response = await api.get('/api/semesters');
      return { data: response.data as Semester[], error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Get semester by ID
  const getById = async (id: number): Promise<ApiResponse<Semester>> => {
    try {
      const response = await api.get(`/api/semesters/${id}`);
      return { data: response.data as Semester, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Create semester with possible attachments
  const create = async (formData: FormData): Promise<ApiResponse<Semester>> => {
    try {
      const response = await api.post('/api/semesters', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { data: response.data as Semester, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Update semester
  const update = async (id: number, payload: UpdateSemesterRequest): Promise<ApiResponse<Semester>> => {
    try {
      const response = await api.put(`/api/semesters/${id}`, payload);
      return { data: response.data as Semester, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Delete semester
  const remove = async (id: number): Promise<ApiResponse<boolean>> => {
    try {
      await api.delete(`/api/semesters/${id}`);
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Add attachment to a semester
  const addAttachment = async (semesterId: number, file: File): Promise<ApiResponse<SemesterAttachment>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post(`/api/semesters/${semesterId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { data: response.data as SemesterAttachment, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Add external URL as attachment
  const addExternalAttachment = async (
    semesterId: number, 
    attachment: { name: string, url: string, type: string }
  ): Promise<ApiResponse<SemesterAttachment>> => {
    try {
      const response = await api.post(`/api/semesters/${semesterId}/attachments/external`, attachment);
      return { data: response.data as SemesterAttachment, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Remove attachment
  const removeAttachment = async (semesterId: number, attachmentId: number): Promise<ApiResponse<boolean>> => {
    try {
      await api.delete(`/api/semesters/${semesterId}/attachments/${attachmentId}`);
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    addAttachment,
    addExternalAttachment,
    removeAttachment
  };
};