import { useAuthenticatedApi } from '../config';
import type {
  ApiResponse,
  AssignTeacherRequest,
  CreateThesisProposalRequest,
  DefenseSession,
  Thesis,
  ThesisAssignment,
  ThesisEvaluation,
  ThesisProposal,
  ThesisRegistration,
  UpdateThesisRequest
} from '../../types/thesis.types';

// Helper function to handle API errors
const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error && typeof error === 'object' && 'isAxiosError' in error && 'response' in error) {
      const axiosError = error as any; // Cast to any since we can't use AxiosError
      return axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
};

// ========== THESIS PROPOSALS ==========
export const useThesisProposals = () => {
  const api = useAuthenticatedApi();

  // Get all thesis proposals
  const getAll = async (): Promise<ApiResponse<ThesisProposal[]>> => {
    try {
      const response = await api.get('/api/theses/proposals/my');
      return { data: response.data as ThesisProposal[], error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Get thesis proposal by ID
  const getById = async (id: string): Promise<ApiResponse<ThesisProposal>> => {
    try {
      const response = await api.get(`/api/theses/proposals/${id}`);
      return { data: response.data as ThesisProposal, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Create thesis proposal (supports file upload)
    const create = async (data: CreateThesisProposalRequest, files?: File[]): Promise<ApiResponse<ThesisProposal>> => {
    try {
        const formData = new FormData();
        
        // Add form fields
        Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            formData.append(key, value);
        }
        });
        
        // Add files if any
        if (files?.length) {
        files.forEach(file => {
            formData.append('attachments', file);
        });
        }
        
        const response = await api.post('/api/theses/proposals', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
        });
        return { data: response.data as ThesisProposal, error: null };
    } catch (error) {
        return { data: null, error: handleApiError(error) };
    }
    };

  // Process (approve/reject) a thesis proposal
  const process = async (
    id: string, 
    status: 'APPROVED' | 'REJECTED', 
    feedbackNote?: string
  ): Promise<ApiResponse<ThesisProposal>> => {
    try {
      const response = await api.patch(`/api/theses/proposals/${id}/process`, {
        status,
        feedbackNote
      });
      return { data: response.data as ThesisProposal, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  return { getAll, getById, create, process };
};

// ========== THESIS MANAGEMENT ==========
export const useTheses = () => {
  const api = useAuthenticatedApi();

  // Get all theses
  const getAll = async (): Promise<ApiResponse<Thesis[]>> => {
    try {
      const response = await api.get('/api/theses/theses');
      return { data: response.data as Thesis[], error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Get my theses (as student or supervisor)
  const getMyTheses = async (): Promise<ApiResponse<Thesis[]>> => {
    try {
      const response = await api.get('/api/theses/theses/my');
      return { data: response.data as Thesis[], error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Get thesis by ID
  const getById = async (id: string): Promise<ApiResponse<Thesis>> => {
    try {
      const response = await api.get(`/api/theses/theses/${id}`);
      return { data: response.data as Thesis, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Update thesis details
  const update = async (id: string, payload: UpdateThesisRequest): Promise<ApiResponse<Thesis>> => {
    try {
      const response = await api.patch(`/api/theses/theses/${id}/status`, payload);
      return { data: response.data as Thesis, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Submit thesis with attachments
  const submitThesis = async (id: string, formData: FormData): Promise<ApiResponse<Thesis>> => {
    try {
      const response = await api.post(`/api/theses/theses/${id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { data: response.data as Thesis, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  return { getAll, getMyTheses, getById, update, submitThesis };
};

// ========== THESIS REGISTRATIONS ==========
export const useThesisRegistrations = () => {
  const api = useAuthenticatedApi();

  // Get all thesis registrations
  const getAll = async (): Promise<ApiResponse<ThesisRegistration[]>> => {
    try {
      const response = await api.get('/api/theses/registrations');
      return { data: response.data as ThesisRegistration[], error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Get thesis registration by ID
  const getById = async (id: string): Promise<ApiResponse<ThesisRegistration>> => {
    try {
      const response = await api.get(`/api/theses/registrations/${id}`);
      return { data: response.data as ThesisRegistration, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Create thesis registration
  const create = async (thesisProposalId: string, semesterId: string): Promise<ApiResponse<ThesisRegistration>> => {
    try {
      const response = await api.post('/api/theses/registrations', { 
        thesisProposalId,
        semesterId
      });
      return { data: response.data as ThesisRegistration, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Process (approve/reject) a thesis registration
  const process = async (
    id: string, 
    status: 'APPROVED' | 'REJECTED', 
    rejectionReason?: string
  ): Promise<ApiResponse<ThesisRegistration>> => {
    try {
      const response = await api.patch(`/api/theses/registrations/${id}/process`, {
        status,
        rejectionReason
      });
      return { data: response.data as ThesisRegistration, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Get registration report
  const getReport = async (registrationId: string): Promise<ApiResponse<Blob>> => {
    try {
      const response = await api.get(`/api/theses/reports/thesis-registration/${registrationId}`, {
        responseType: 'blob'
      });
      return { data: response.data as Blob, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  return { getAll, getById, create, process, getReport };
};

// ========== THESIS ASSIGNMENTS ==========
export const useThesisAssignments = () => {
  const api = useAuthenticatedApi();

  // Get assignments for a thesis
  const getByThesisId = async (thesisId: string): Promise<ApiResponse<ThesisAssignment[]>> => {
    try {
      const response = await api.get(`/api/theses/theses/${thesisId}/assignments`);
      return { data: response.data as ThesisAssignment[], error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Assign teacher to thesis
  const assign = async (thesisId: string, request: AssignTeacherRequest): Promise<ApiResponse<ThesisAssignment>> => {
    try {
      const response = await api.post(`/api/theses/theses/${thesisId}/assignments`, request);
      return { data: response.data as ThesisAssignment, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Remove teacher assignment
  const remove = async (thesisId: string, teacherId: string, role: string): Promise<ApiResponse<void>> => {
    try {
      await api.delete(`/api/theses/theses/${thesisId}/assignments`, {
        data: { teacherId: teacherId as string, role: role as string }
      } as any );
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  return { getByThesisId, assign, remove };
};

// ========== DEFENSE SESSIONS ==========
export const useDefenseSessions = () => {
  const api = useAuthenticatedApi();

  // Get upcoming defense sessions
  const getUpcoming = async (): Promise<ApiResponse<DefenseSession[]>> => {
    try {
      const response = await api.get('/api/theses/defense-sessions/upcoming');
      return { data: response.data as DefenseSession[], error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Schedule defense session
  const schedule = async (
    thesisId: string, 
    scheduledDate: string, 
    location: string,
    committeeMembers: string[]
  ): Promise<ApiResponse<DefenseSession>> => {
    try {
      const response = await api.post('/api/theses/defense-sessions', {
        thesisId,
        scheduledDate,
        location,
        committeeMembers
      });
      return { data: response.data as DefenseSession, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Reschedule defense session
  const reschedule = async (
    id: string, 
    scheduledDate: string, 
    location: string
  ): Promise<ApiResponse<DefenseSession>> => {
    try {
      const response = await api.patch(`/api/theses/defense-sessions/${id}/reschedule`, {
        scheduledDate,
        location
      });
      return { data: response.data as DefenseSession, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Complete defense session
  const complete = async (id: string, notes?: string): Promise<ApiResponse<DefenseSession>> => {
    try {
      const response = await api.patch(`/api/theses/defense-sessions/${id}/complete`, { notes });
      return { data: response.data as DefenseSession, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  return { getUpcoming, schedule, reschedule, complete };
};

// ========== THESIS EVALUATIONS ==========
export const useThesisEvaluations = () => {
  const api = useAuthenticatedApi();

  // Get evaluations for a thesis
  const getByThesisId = async (thesisId: string): Promise<ApiResponse<ThesisEvaluation[]>> => {
    try {
      const response = await api.get(`/api/theses/theses/${thesisId}/evaluations`);
      return { data: response.data as ThesisEvaluation[], error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Submit evaluation
  const submit = async (
    thesisId: string,
    evaluationType: string,
    grade: number,
    comments: string
  ): Promise<ApiResponse<ThesisEvaluation>> => {
    try {
      const response = await api.post('/api/theses/theses/evaluations', {
        thesisId,
        evaluationType,
        grade,
        comments
      });
      return { data: response.data as ThesisEvaluation, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Get final grade for a thesis
  const getFinalGrade = async (thesisId: string): Promise<ApiResponse<number>> => {
    try {
      const response = await api.get(`/api/theses/theses/${thesisId}/final-grade`);
      return { data: response.data as number, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  // Get evaluation report
  const getReport = async (thesisId: string): Promise<ApiResponse<Blob>> => {
    try {
      const response = await api.get(`/api/theses/reports/evaluation/${thesisId}`, {
        responseType: 'blob'
      });
      return { data: response.data as Blob, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  };

  return { getByThesisId, submit, getFinalGrade, getReport };
};