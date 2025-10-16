import { useAuthenticatedApi } from '../config';
import type { 
  ApiResponse,
  Attachment,
  ExternalAttachmentRequest
} from '../../types/attachment.types';

// Hook to use authenticated attachment API
export const useAttachmentApi = () => {
  const authApi = useAuthenticatedApi();
  
  return {
    // Get attachments by entity type and ID
    getByEntity: async (
      entityType: string, 
      entityId: string
    ): Promise<ApiResponse<Attachment[]>> => {
      try {
        const response = await authApi.get(`/api/attachments/${entityType}/${entityId}`);
        return { data: response.data as Attachment[], error: null };
      } catch (error) {
        console.error('Error fetching attachments:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to fetch attachments' 
        };
      }
    },
    
    // Get a specific attachment by ID
    getById: async (id: string): Promise<ApiResponse<Attachment>> => {
      try {
        const response = await authApi.get(`/api/attachments/${id}`);
        return { data: response.data as Attachment, error: null };
      } catch (error) {
        console.error('Error fetching attachment:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to fetch attachment' 
        };
      }
    },
    
    // Upload files as attachments
    uploadFiles: async (
      files: File | File[], 
      entityType: string, 
      entityId: string
    ): Promise<ApiResponse<Attachment[]>> => {
      try {
        const formData = new FormData();
        
        // Add files to form data
        if (Array.isArray(files)) {
          files.forEach(file => formData.append('files', file));
        } else {
          formData.append('files', files);
        }
        
        // Add entity metadata
        formData.append('entityType', entityType);
        formData.append('entityId', entityId);
        
        const response = await authApi.post('/api/attachments', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return { data: response.data as Attachment[], error: null };
      } catch (error) {
        console.error('Error uploading files:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to upload files' 
        };
      }
    },
    
    // Create external attachment (URL)
    createExternalLink: async (
      request: ExternalAttachmentRequest
    ): Promise<ApiResponse<Attachment>> => {
      try {
        const response = await authApi.post('/api/attachments', request, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        return { data: response.data as Attachment, error: null };
      } catch (error) {
        console.error('Error creating external link:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to create external link' 
        };
      }
    },
    
    // Delete an attachment
    deleteAttachment: async (id: string): Promise<ApiResponse<void>> => {
      try {
        await authApi.delete(`/api/attachments/${id}`);
        return { data: null, error: null };
      } catch (error) {
        console.error('Error deleting attachment:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to delete attachment' 
        };
      }
    }
  };
};