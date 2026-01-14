import { useAuthenticatedApi } from '../config';
import { useCallback, useMemo } from 'react';
import type { 
  ApiResponse,
  Attachment,
  ExternalAttachmentRequest
} from '../../types/attachment.types';

const BASE_PATH = '/api/attachments';

const entityTypes = ['topic', 'prethesis_submission', 'thesis_submission', 'announcement', 'topic_application', 'thesis_proposal',  'thesis_registration', 'system', 'other'] as const;

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

export const useAttachmentApi = () => {
  const authApi = useAuthenticatedApi();

  const getByEntity = useCallback(async (
    entityType: typeof entityTypes[number],
    entityId: number
  ): Promise<ApiResponse<Attachment[]>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/${entityType}/${entityId}`);
      return { data: res.data as Attachment[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [authApi]);

  const getById = useCallback(async (id: number): Promise<ApiResponse<Attachment>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/${id}`);
      return { data: res.data as Attachment, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [authApi]);

  const uploadFiles = useCallback(async (
    files: FileList,
    entityType: typeof entityTypes[number],
    entityId: number
  ): Promise<ApiResponse<Attachment[]>> => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));
    try {
      const res = await authApi.post(`${BASE_PATH}/${entityType}/${entityId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { data: res.data.data, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [authApi]);

  const createExternalLink = useCallback(async (
    request: ExternalAttachmentRequest
  ): Promise<ApiResponse<Attachment>> => {
    try {
      const res = await authApi.post(BASE_PATH, request, {
        headers: { 'Content-Type': 'application/json' },
      });
      return { data: res.data as Attachment, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [authApi]);

  const downloadAttachment = useCallback(async (id: number): Promise<ApiResponse<Blob>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/download/${id}`, {
        responseType: 'blob',
      });
      return { data: res.data as Blob, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [authApi]);

  const deleteAttachment = useCallback(async (id: number): Promise<ApiResponse<void>> => {
    try {
      await authApi.delete(`${BASE_PATH}/${id}`);
      return { data: null, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [authApi]);

  return useMemo(() => ({
    getByEntity,
    getById,
    uploadFiles,
    createExternalLink,
    downloadAttachment,
    delete: deleteAttachment
  }), [getByEntity, getById, uploadFiles, createExternalLink, downloadAttachment, deleteAttachment]);
};