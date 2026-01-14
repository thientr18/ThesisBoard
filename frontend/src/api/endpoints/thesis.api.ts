import { useAuthenticatedApi } from '../config';
import { useCallback, useMemo } from 'react';
import type {
  ApiResponse,
  CreateThesisProposalRequest,
  Thesis,
  ThesisAssignment,
  ThesisEvaluation,
  ThesisProposal,
  ThesisRegistration,
  UpdateThesisRequest
} from '../../types/thesis.types';

const BASE = '/api/theses';
const PROPOSALS_PATH = `${BASE}/proposals`;
const REGISTRATIONS_PATH = `${BASE}/registrations`;
const DEFENSE_PATH = `${BASE}/defense-sessions`;
const REPORTS_PATH = `${BASE}/reports`;

const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    const anyErr = error as any;
    if (anyErr?.response?.data) {
      const data = anyErr.response.data;
      if (data.message) {
        let msg = data.message;
        if (data.code) msg += ` (code: ${data.code})`;
        if (data.details) msg += `: ${JSON.stringify(data.details)}`;
        return msg;
      }
      return JSON.stringify(data);
    }
    return error.message;
  }
  return 'An unexpected error occurred';
};

// ========== THESIS PROPOSALS ==========
export const useThesisProposals = () => {
  const api = useAuthenticatedApi();

  const getTeacherAvailable = useCallback(async (semesterId: number): Promise<ApiResponse<any[]>> => {
    try {
      const res = await api.get(`${PROPOSALS_PATH}/teacher/${semesterId}`);
      return { data: Array.isArray(res.data?.data) ? res.data.data : [], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  // check attachments handling
  const create = useCallback(async (
    data: CreateThesisProposalRequest,
  ): Promise<ApiResponse<ThesisProposal>> => {
    try {
      const res = await api.post(PROPOSALS_PATH, data);
      return { data: res.data?.data as ThesisProposal, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getById = useCallback(async (id: number): Promise<ApiResponse<ThesisProposal>> => {
    try {
      const res = await api.get(`${PROPOSALS_PATH}/${id}`);
      return { data: res.data?.data as ThesisProposal, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const process = useCallback(async (
    id: number,
    decision: 'accepted' | 'rejected',
    note?: string,
    title?: string,
    abstract?: string
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await api.patch(`${PROPOSALS_PATH}/${id}/process`, { decision, note, title, abstract });
      return { data: res.data?.data as any, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const cancel = useCallback(async (
    id: number
  ): Promise<ApiResponse<ThesisProposal>> => {
    try {
      const res = await api.patch(`${PROPOSALS_PATH}/${id}/cancel`, { status: 'cancelled' });
      return { data: res.data?.data as ThesisProposal, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getProposalOfStudent = useCallback(async (
    semesterId: number,
  ): Promise<ApiResponse<ThesisProposal[]>> => {
    try {
      const res = await api.get(`${PROPOSALS_PATH}/student/me/${semesterId}`);
      return { data: res.data?.data as ThesisProposal[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getProposalOfTeacher = useCallback(async (
    semesterId: number
  ): Promise<ApiResponse<ThesisProposal[]>> => {
    try {
      const res = await api.get(`${PROPOSALS_PATH}/teacher/me/${semesterId}`);
      return { data: res.data?.data as ThesisProposal[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const update = useCallback(async (
    id: number,
    data: Partial<CreateThesisProposalRequest>,
  ): Promise<ApiResponse<ThesisProposal>> => {
    try {
      const res = await api.put(`${PROPOSALS_PATH}/${id}`, data);
      return { data: res.data?.data as ThesisProposal, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  return useMemo(() => ({
    getTeacherAvailable,
    getById,
    create,
    process,
    cancel,
    getProposalOfStudent,
    getProposalOfTeacher,
    update
  }), [getTeacherAvailable, getById, create, process, cancel, getProposalOfStudent, getProposalOfTeacher, update]);
};

// ========== THESIS REGISTRATIONS ==========
export const useThesisRegistrations = () => {
  const api = useAuthenticatedApi();

  const getAll = useCallback(async (
    filter?: {
      semesterId?: number,
      status?: string[]
    }
  ): Promise<ApiResponse<ThesisRegistration[]>> => {
    try {
      const res = await api.get(REGISTRATIONS_PATH, filter ? { params: filter } : undefined);
      return { data: res.data?.data as ThesisRegistration[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getRegistrationOfTeacher = useCallback(async (
    semesterId: number
  ): Promise<ApiResponse<ThesisRegistration[]>> => {
    try {
      const res = await api.get(`${REGISTRATIONS_PATH}/teacher/me/${semesterId}`);
      return { data: res.data?.data as ThesisRegistration[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const process = useCallback(async (
    id: number,
    decision: 'approved' | 'rejected',
    decisionReason?: string
  ): Promise<ApiResponse<ThesisRegistration>> => {
    try {
      const res = await api.patch(`${REGISTRATIONS_PATH}/${id}/process`, { decision, decisionReason });
      return { data: res.data?.data as ThesisRegistration, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const update = useCallback(async (
    id: number,
    data: {
      title?: string;
      abstract?: string;
      note?: string;
    },
  ): Promise<ApiResponse<ThesisRegistration>> => {
    try {
      const res = await api.put(`${REGISTRATIONS_PATH}/${id}`, data);
      return { data: res.data?.data as ThesisRegistration, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  return useMemo(() => ({
    getAll,
    process,
    update,
    getRegistrationOfTeacher
  }), [getAll, process, update, getRegistrationOfTeacher]);
};

// ========== THESES ==========
export const useTheses = () => {
  const api = useAuthenticatedApi();

  const getAll = useCallback(async (): Promise<ApiResponse<Thesis[]>> => {
    try {
      const res = await api.get(BASE);
      return { data: res.data?.data as Thesis[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getMyTheses = useCallback(async (): Promise<ApiResponse<Thesis[]>> => {
    try {
      const res = await api.get(`${BASE}/my`);
      return { data: res.data?.data as Thesis[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getThesisForStudentAndSemester = useCallback(async (semesterId: number): Promise<ApiResponse<Thesis>> => {
    try {
      const res = await api.get(`${BASE}/student/me/${semesterId}`);
      return { data: res.data?.data as Thesis, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getThesesBySupervisor = useCallback(async (semesterId: number): Promise<ApiResponse<Thesis[]>> => {
    try {
      const res = await api.get(`${BASE}/supervisor/me/${semesterId}`);
      return { data: res.data?.data as Thesis[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getThesesByAssignedTeacher = useCallback(async (semesterId: number): Promise<ApiResponse<Thesis[]>> => {
    try {
      const res = await api.get(`${BASE}/assignment/me/${semesterId}`);
      return { data: res.data?.data as Thesis[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getThesesForTeacherBySemester = useCallback(async (semesterId: number): Promise<ApiResponse<Thesis[]>> => {
    try {
      const [supervisorRes, assignedRes] = await Promise.all([
        api.get(`${BASE}/supervisor/me/${semesterId}`),
        api.get(`${BASE}/assignment/me/${semesterId}`)
      ]);

      const supervisorTheses = supervisorRes.data?.data || [];
      const assignedTheses = assignedRes.data?.data || [];

      const allTheses = [...supervisorTheses, ...assignedTheses];

      return { data: allTheses, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getThesesBySemester = useCallback(async (semesterId: number): Promise<ApiResponse<Thesis[]>> => {
    try {
      const res = await api.get(`${BASE}/semester/${semesterId}`);
      return { data: res.data?.data as Thesis[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getById = useCallback(async (id: number): Promise<ApiResponse<Thesis>> => {
    try {
      const res = await api.get(`${BASE}/${id}`);
      return { data: res.data?.data as Thesis, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const update = useCallback(async (id: number, payload: UpdateThesisRequest): Promise<ApiResponse<Thesis>> => {
    try {
      const res = await api.patch(`${BASE}/${id}/status`, payload);
      return { data: res.data?.data as Thesis, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const gradeThesis = useCallback(async (
    id: number,
    gradingData: { role: string; score: number; comments: string }
  ): Promise<ApiResponse<Thesis>> => {
    try {
      const res = await api.post(`${BASE}/evaluations`, {
        thesisId: id,
        role: gradingData.role,
        score: gradingData.score,
        comments: gradingData.comments
      });
      return { data: res.data?.data as Thesis, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getReport = useCallback(async (thesisId: number): Promise<ApiResponse<Blob>> => {
    try {
      const res = await api.get(`${REPORTS_PATH}/${thesisId}`, {
        responseType: 'blob'
      });
      return { data: res.data as Blob, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  return useMemo(() => ({
    getAll,
    getMyTheses,
    getThesisForStudentAndSemester,
    getThesesBySupervisor,
    getThesesByAssignedTeacher,
    getThesesForTeacherBySemester,
    getById,
    getThesesBySemester,
    update,
    gradeThesis,
    getReport
  }), [getAll, getMyTheses, getThesisForStudentAndSemester, getThesesBySupervisor, getThesesByAssignedTeacher, getThesesForTeacherBySemester, getById, getThesesBySemester, update, gradeThesis, getReport]);
};

// ========== THESIS ASSIGNMENTS ==========
export const useThesisAssignments = () => {
  const api = useAuthenticatedApi();

  const getByThesisId = useCallback(async (thesisId: number): Promise<ApiResponse<ThesisAssignment[]>> => {
    try {
      const res = await api.get(`${BASE}/${thesisId}/assignments`);
      return { data: res.data?.data as ThesisAssignment[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const assign = useCallback(async (
    thesisId: number,
    teacherId: number,
    role: 'reviewer' | 'committee_member'
  ): Promise<ApiResponse<ThesisAssignment>> => {
    try {
      const res = await api.post(`${BASE}/${thesisId}/assignments`, { teacherId, role });
      return { data: res.data?.data as ThesisAssignment, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const remove = useCallback(async (
    thesisId: number,
    teacherId: number,
    role: string
  ): Promise<ApiResponse<void>> => {
    try {
      await api.delete(`${BASE}/${thesisId}/assignments`, {
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

  const schedule = useCallback(async (
    thesisId: number,
    scheduledAt: string,
    room: string,
    notes?: string
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(`${DEFENSE_PATH}`, {
        thesisId,
        scheduledAt,
        room,
        notes,
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  }, [api]);

  const reschedule = useCallback(async (
    sessionId: number,
    scheduledAt: string,
    room: string,
    notes?: string
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await api.patch(`${DEFENSE_PATH}/${sessionId}`, {
        scheduledAt,
        room,
        notes,
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  }, [api]);

  const complete = useCallback(async (
    sessionId: number,
    notes?: string
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await api.patch(`${DEFENSE_PATH}/${sessionId}/complete`, {
        notes,
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error) };
    }
  }, [api]);

  return useMemo(() => ({
    schedule,
    reschedule,
    complete,
  }), [schedule, reschedule, complete]);
};

// ========== THESIS EVALUATIONS ==========
export const useThesisEvaluations = () => {
  const api = useAuthenticatedApi();

  const getByThesisId = useCallback(async (thesisId: number): Promise<ApiResponse<ThesisEvaluation[]>> => {
    try {
      const res = await api.get(`${BASE}/${thesisId}/evaluations`);
      return { data: res.data?.data as ThesisEvaluation[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const submit = useCallback(async (
    thesisId: number,
    evaluationType: string,
    grade: number,
    comments: string
  ): Promise<ApiResponse<ThesisEvaluation>> => {
    try {
      const res = await api.post(`${BASE}/evaluations`, {
        thesisId,
        evaluationType,
        grade,
        comments
      });
      return { data: res.data?.data as ThesisEvaluation, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getFinalGrade = useCallback(async (thesisId: number): Promise<ApiResponse<number>> => {
    try {
      const res = await api.get(`${BASE}/${thesisId}/final-grade`);
      return { data: res.data?.data as number, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  return useMemo(() => ({
    getByThesisId,
    submit,
    getFinalGrade
  }), [getByThesisId, submit, getFinalGrade]);
};

// ========== THESIS STATISTICS ==========
export const useThesisStatistics = () => {
  const api = useAuthenticatedApi();

  // GET /api/theses/stats/outcomes
  const getOutcomeStats = useCallback(async (): Promise<ApiResponse<any[]>> => {
    try {
      const res = await api.get(`${BASE}/stats/outcomes`);
      return { data: res.data?.data || res.data, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  // GET /api/theses/stats/grades
  const getGradeStats = useCallback(async (): Promise<ApiResponse<any[]>> => {
    try {
      const res = await api.get(`${BASE}/stats/grades`);
      return { data: res.data?.data || res.data, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  return useMemo(() => ({
    getOutcomeStats,
    getGradeStats,
  }), [getOutcomeStats, getGradeStats]);
};