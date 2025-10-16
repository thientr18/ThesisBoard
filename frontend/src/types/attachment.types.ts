export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

// Attachment
export interface Attachment {
  id: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  url: string;
  entityType: string;
  entityId: string;
  isExternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalAttachmentRequest {
  url: string;
  fileName: string;
  entityType: string;
  entityId: string;
}

export interface AttachmentFilter {
  entityType: string;
  entityId: string;
}