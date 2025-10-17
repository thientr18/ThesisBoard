export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface Semester {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  attachments?: SemesterAttachment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SemesterAttachment {
  id: number;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface CreateSemesterRequest {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface UpdateSemesterRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}