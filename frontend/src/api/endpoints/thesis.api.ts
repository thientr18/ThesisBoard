import { useAuthenticatedApi } from '../config';
import { useCallback, useMemo } from 'react';
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

const BASE = '/api/theses';
const PROPOSALS_PATH = `${BASE}/proposals`;
const THESES_PATH = `${BASE}/theses`;
const REGISTRATIONS_PATH = `${BASE}/registrations`;
const DEFENSE_PATH = `${BASE}/defense-sessions`;
const REPORTS_PATH = `${BASE}/reports`;

const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    const anyErr = error as any;
    if (anyErr?.response?.data?.message) return anyErr.response.data.message;
    return error.message;
  }
  return 'An unexpected error occurred';
};

// ========== THESIS PROPOSALS ==========
export const useThesisProposals = () => {
  const api = useAuthenticatedApi();

  const getAll = useCallback(async (): Promise<ApiResponse<ThesisProposal[]>> => {
    try {
      const res = await api.get(`${PROPOSALS_PATH}/my`);
      return { data: res.data as ThesisProposal[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getById = useCallback(async (id: string): Promise<ApiResponse<ThesisProposal>> => {
    try {
      const res = await api.get(`${PROPOSALS_PATH}/${id}`);
      return { data: res.data as ThesisProposal, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const create = useCallback(async (
    data: CreateThesisProposalRequest,
    files?: File[]
  ): Promise<ApiResponse<ThesisProposal>> => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, v as any);
      });
      if (files?.length) files.forEach(f => formData.append('attachments', f));
      const res = await api.post(PROPOSALS_PATH, formData);
      return { data: res.data as ThesisProposal, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const process = useCallback(async (
    id: string,
    status: 'APPROVED' | 'REJECTED',
    feedbackNote?: string
  ): Promise<ApiResponse<ThesisProposal>> => {
    try {
      const res = await api.patch(`${PROPOSALS_PATH}/${id}/process`, { status, feedbackNote });
      return { data: res.data as ThesisProposal, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  return useMemo(() => ({
    getAll,
    getById,
    create,
    process
  }), [getAll, getById, create, process]);
};

// ========== THESES ==========
export const useTheses = () => {
  const api = useAuthenticatedApi();

  const getAll = useCallback(async (): Promise<ApiResponse<Thesis[]>> => {
    try {
      const res = await api.get(THESES_PATH);
      return { data: res.data as Thesis[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getMyTheses = useCallback(async (): Promise<ApiResponse<Thesis[]>> => {
    try {
      const res = await api.get(`${THESES_PATH}/my`);
      return { data: res.data as Thesis[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getById = useCallback(async (id: string): Promise<ApiResponse<Thesis>> => {
    try {
      const res = await api.get(`${THESES_PATH}/${id}`);
      return { data: res.data as Thesis, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const update = useCallback(async (id: string, payload: UpdateThesisRequest): Promise<ApiResponse<Thesis>> => {
    try {
      const res = await api.patch(`${THESES_PATH}/${id}/status`, payload);
      return { data: res.data as Thesis, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const submitThesis = useCallback(async (id: string, formData: FormData): Promise<ApiResponse<Thesis>> => {
    try {
      const res = await api.post(`${THESES_PATH}/${id}/submit`, formData);
      return { data: res.data as Thesis, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  return useMemo(() => ({
    getAll,
    getMyTheses,
    getById,
    update,
    submitThesis
  }), [getAll, getMyTheses, getById, update, submitThesis]);
};

// ========== THESIS REGISTRATIONS ==========
export const useThesisRegistrations = () => {
  const api = useAuthenticatedApi();

  const getAll = useCallback(async (): Promise<ApiResponse<ThesisRegistration[]>> => {
    try {
      const res = await api.get(REGISTRATIONS_PATH);
      return { data: res.data as ThesisRegistration[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getById = useCallback(async (id: string): Promise<ApiResponse<ThesisRegistration>> => {
    try {
      const res = await api.get(`${REGISTRATIONS_PATH}/${id}`);
      return { data: res.data as ThesisRegistration, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const create = useCallback(async (
    thesisProposalId: string,
    semesterId: string
  ): Promise<ApiResponse<ThesisRegistration>> => {
    try {
      const res = await api.post(REGISTRATIONS_PATH, { thesisProposalId, semesterId });
      return { data: res.data as ThesisRegistration, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const process = useCallback(async (
    id: string,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string
  ): Promise<ApiResponse<ThesisRegistration>> => {
    try {
      const res = await api.patch(`${REGISTRATIONS_PATH}/${id}/process`, { status, rejectionReason });
      return { data: res.data as ThesisRegistration, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getReport = useCallback(async (registrationId: string): Promise<ApiResponse<Blob>> => {
    try {
      const res = await api.get(`${REPORTS_PATH}/thesis-registration/${registrationId}`, {
        responseType: 'blob'
      });
      return { data: res.data as Blob, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  return useMemo(() => ({
    getAll,
    getById,
    create,
    process,
    getReport
  }), [getAll, getById, create, process, getReport]);
};

// ========== THESIS ASSIGNMENTS ==========
export const useThesisAssignments = () => {
  const api = useAuthenticatedApi();

  const getByThesisId = useCallback(async (thesisId: string): Promise<ApiResponse<ThesisAssignment[]>> => {
    try {
      const res = await api.get(`${THESES_PATH}/${thesisId}/assignments`);
      return { data: res.data as ThesisAssignment[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const assign = useCallback(async (
    thesisId: string,
    request: AssignTeacherRequest
  ): Promise<ApiResponse<ThesisAssignment>> => {
    try {
      const res = await api.post(`${THESES_PATH}/${thesisId}/assignments`, request);
      return { data: res.data as ThesisAssignment, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const remove = useCallback(async (
    thesisId: string,
    teacherId: string,
    role: string
  ): Promise<ApiResponse<void>> => {
    try {
      await api.delete(`${THESES_PATH}/${thesisId}/assignments`, {
        data: { teacherId, role }
      });
      return { data: null, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  return useMemo(() => ({
    getByThesisId,
    assign,
    remove
  }), [getByThesisId, assign, remove]);
};

// ========== DEFENSE SESSIONS ==========
export const useDefenseSessions = () => {
  const api = useAuthenticatedApi();

  const getUpcoming = useCallback(async (): Promise<ApiResponse<DefenseSession[]>> => {
    try {
      const res = await api.get(`${DEFENSE_PATH}/upcoming`);
      return { data: res.data as DefenseSession[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const schedule = useCallback(async (
    thesisId: string,
    scheduledDate: string,
    location: string,
    committeeMembers: string[]
  ): Promise<ApiResponse<DefenseSession>> => {
    try {
      const res = await api.post(DEFENSE_PATH, {
        thesisId,
        scheduledDate,
        location,
        committeeMembers
      });
      return { data: res.data as DefenseSession, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const reschedule = useCallback(async (
    id: string,
    scheduledDate: string,
    location: string
  ): Promise<ApiResponse<DefenseSession>> => {
    try {
      const res = await api.patch(`${DEFENSE_PATH}/${id}/reschedule`, {
        scheduledDate,
        location
      });
      return { data: res.data as DefenseSession, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const complete = useCallback(async (
    id: string,
    notes?: string
  ): Promise<ApiResponse<DefenseSession>> => {
    try {
      const res = await api.patch(`${DEFENSE_PATH}/${id}/complete`, { notes });
      return { data: res.data as DefenseSession, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  return useMemo(() => ({
    getUpcoming,
    schedule,
    reschedule,
    complete
  }), [getUpcoming, schedule, reschedule, complete]);
};

// ========== THESIS EVALUATIONS ==========
export const useThesisEvaluations = () => {
  const api = useAuthenticatedApi();

  const getByThesisId = useCallback(async (thesisId: string): Promise<ApiResponse<ThesisEvaluation[]>> => {
    try {
      const res = await api.get(`${THESES_PATH}/${thesisId}/evaluations`);
      return { data: res.data as ThesisEvaluation[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const submit = useCallback(async (
    thesisId: string,
    evaluationType: string,
    grade: number,
    comments: string
  ): Promise<ApiResponse<ThesisEvaluation>> => {
    try {
      const res = await api.post(`${THESES_PATH}/evaluations`, {
        thesisId,
        evaluationType,
        grade,
        comments
      });
      return { data: res.data as ThesisEvaluation, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getFinalGrade = useCallback(async (thesisId: string): Promise<ApiResponse<number>> => {
    try {
      const res = await api.get(`${THESES_PATH}/${thesisId}/final-grade`);
      return { data: res.data as number, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getReport = useCallback(async (thesisId: string): Promise<ApiResponse<Blob>> => {
    try {
      const res = await api.get(`${REPORTS_PATH}/evaluation/${thesisId}`, {
        responseType: 'blob'
      });
      return { data: res.data as Blob, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  return useMemo(() => ({
    getByThesisId,
    submit,
    getFinalGrade,
    getReport
  }), [getByThesisId, submit, getFinalGrade, getReport]);
};