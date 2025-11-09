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
    files: File | File[],
    entityType: string,
    entityId: string
  ): Promise<ApiResponse<Attachment[]>> => {
    try {
      const formData = new FormData();
      if (Array.isArray(files)) {
        files.forEach(f => formData.append('files', f));
      } else {
        formData.append('files', files);
      }
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);

      // Let browser set multipart boundary automatically
      const res = await authApi.post(BASE_PATH, formData);
      return { data: res.data as Attachment[], error: null };
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
    delete: deleteAttachment
  }), [getByEntity, getById, uploadFiles, createExternalLink, deleteAttachment]);
};