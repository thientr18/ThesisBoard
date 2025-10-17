export interface BaseResponse<T> {
  data: T | null;
  error: string | null;
}

export interface Topic {
  id: number;
  supervisorId: number;
  semesterId: number;
  title: string;
  description: string | null;
  requirements: string | null;
  tags: object | null;
  maxSlots: number | null;
  createdAt: string;
  updatedAt: string;
  status: 'OPEN' | 'CLOSED';
}

export interface TopicApplication {
  id: number;
  topicId: number;
  studentId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  note: string | null;
  decidedAt: string | null;
  proposalTitle: string | null;
  proposalAbstract: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PreThesis {
  id: number;
  title: string;
  description: string;
  studentId: number;
  supervisorId: number;
  semesterId: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'CANCELLED';
  finalScore?: number | null;
  feedback?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PreThesisGrade {
  grade: number;
  feedback: string;
}

export interface CreatePreThesisRequest {
  title: string;
  description: string;
  studentId: number;
  semesterId: number;
  attachments?: File[];
}

export interface UpdatePreThesisRequest {
  title?: string;
  description?: string;
  status?: string;
}

export interface PreThesisStats {
  total: number;
  inProgress: number;
  submitted: number;
  graded: number;
  cancelled: number;
  averageGrade?: number | null;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number | null;
}