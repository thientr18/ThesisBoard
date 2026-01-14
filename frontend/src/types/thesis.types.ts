import type { Attachment } from "./attachment.types";

export type Status = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ThesisStatus = 'REGISTERED' | 'IN_PROGRESS' | 'REVIEWING' | 'DEFENDED' | 'COMPLETED' | 'FAILED';
export type EvaluationType = 'SUPERVISOR' | 'REVIEWER' | 'COMMITTEE';
export type TeacherRole = 'SUPERVISOR' | 'REVIEWER' | 'COMMITTEE_MEMBER' | 'COMMITTEE_CHAIR';

export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface ThesisProposal {
  id: number;
  title: string;
  abstract: string | null;
  note: string | null;
  status: 'submitted' | 'accepted' | 'rejected' | 'cancelled';
  studentId: number;
  targetTeacherId: number;
  semesterId: number;
  decidedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Populated relations
  targetTeacher?: {
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
    }
  };
  student?: {
    id: number;
    user: {
      id: number;
      fullName: string;
      email: string;
    }
  };
  attachments?: Attachment[];
}

export interface ThesisRegistration {
  id: string;
  thesisProposalId: string;
  thesisProposal?: ThesisProposal;
  semesterId: string;
  status: Status;
  approvalDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Thesis {
  id: string;
  title: string;
  registrationId: string;
  registration?: ThesisRegistration;
  studentId: string;
  student?: User;
  supervisorId: string;
  supervisor?: User;
  status: ThesisStatus;
  submissionDate?: string;
  finalGrade?: number;
  createdAt: string;
  updatedAt: string;
  thesis?: any;
}

export interface ThesisAssignment {
  id: string;
  thesisId: string;
  teacherId: string;
  teacher?: User;
  role: TeacherRole;
  createdAt: string;
  updatedAt: string;
}

export interface DefenseSession {
  id: string;
  thesisId: string;
  thesis?: Thesis;
  scheduledDate: string;
  location: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThesisEvaluation {
  id: string;
  thesisId: string;
  evaluatorId: string;
  evaluator?: User;
  evaluationType: EvaluationType;
  grade: number;
  comments: string;
  submissionDate: string;
}

// Request interfaces
export interface CreateThesisProposalRequest {
  title: string;
  description: string;
  objectives: string;
  supervisorId?: string;
}

export interface UpdateThesisRequest {
  title?: string;
  description?: string;
  status?: ThesisStatus;
  notes?: string;
}

export interface AssignTeacherRequest {
  teacherId: string;
  role: TeacherRole;
}

// Response wrapper
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}