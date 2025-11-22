export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface Semester {
  id: number;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
  attachments?: SemesterAttachment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentSemester {
  id: number;
  fullName: string;
  studentCode: string;
  email?: string;
  status?: string;
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