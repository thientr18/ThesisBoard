import { useAuthenticatedApi } from '../config';
import { useCallback, useMemo } from 'react';
import type { 
  ApiResponse,
  Attachment,
  ExternalAttachmentRequest
} from '../../types/attachment.types';

const BASE_PATH = '/api/attachments';

export const useAttachmentApi = () => {
  const authApi = useAuthenticatedApi();

  const getByEntity = useCallback(async (
    entityType: string,
    entityId: string
  ): Promise<ApiResponse<Attachment[]>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/${entityType}/${entityId}`);
      return { data: res.data as Attachment[], error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch attachments' };
    }
  }, [authApi]);

  const getById = useCallback(async (id: string): Promise<ApiResponse<Attachment>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/${id}`);
      return { data: res.data as Attachment, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch attachment' };
    }
  }, [authApi]);

  const uploadFiles = useCallback(async (
    files: FileList,
    entityType: string,
    entityId: string
  ): Promise<ApiResponse<Attachment[]>> => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));
    try {
      const res = await authApi.post(`${BASE_PATH}/${entityType}/${entityId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { data: res.data.data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to upload files' };
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
      return { data: null, error: e instanceof Error ? e.message : 'Failed to create external link' };
    }
  }, [authApi]);

  const downloadAttachment = useCallback(async (id: string): Promise<ApiResponse<Blob>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/download/${id}`, {
        responseType: 'blob',
      });
      return { data: res.data as Blob, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to download attachment' };
    }
  }, [authApi]);

  const deleteAttachment = useCallback(async (id: string): Promise<ApiResponse<void>> => {
    try {
      await authApi.delete(`${BASE_PATH}/${id}`);
      return { data: null, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to delete attachment' };
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