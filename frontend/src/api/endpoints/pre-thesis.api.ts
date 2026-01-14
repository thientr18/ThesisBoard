import { useCallback, useMemo } from 'react';
import { useAuthenticatedApi } from '../config';
import type {
  BaseResponse,
  Topic,
  TopicApplication,
  PreThesis,
  PreThesisGrade,
  PreThesisStats,
  ApplicationStats,
} from '../../types/pre-thesis.types';

const BASE = '/api/pre-theses';
const TOPICS_PATH = `${BASE}/topics`;
const APPLICATIONS_PATH = `${BASE}/applications`;
const PRETHESIS_PATH = `${BASE}/pretheses`;
const STATS_PATH = `${BASE}/stats`;
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

export const usePreThesisApi = () => {
  const api = useAuthenticatedApi();

  // Topics
  const getTopics = useCallback(async (): Promise<BaseResponse<Topic[]>> => {
    try {
      const res = await api.get(TOPICS_PATH);
      return { data: res.data?.data as Topic[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getTopicsBySemester = useCallback(async (semesterId: number | string): Promise<BaseResponse<Topic[]>> => {
    try {
      const res = await api.get(`${TOPICS_PATH}/semester/${semesterId}`);
      return { data: res.data?.data as Topic[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getTopicById = useCallback(async (id: number | string): Promise<BaseResponse<Topic>> => {
    try {
      const res = await api.get(`${TOPICS_PATH}/${id}`);
      return { data: res.data?.data as Topic, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getTopicsWithSlots = useCallback(async (semesterId?: number | string): Promise<BaseResponse<Topic[]>> => {
    try {
      const res = await api.get(`${TOPICS_PATH}/with-slots`, { params: { semesterId } });
      return { data: res.data?.data as Topic[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getOwnTopicsInActiveSemester = useCallback(async (semesterId?: number | string): Promise<BaseResponse<Topic[]>> => {
    try {
      const res = await api.get(`${TOPICS_PATH}/active-semester/own`, { params: { semesterId } });
      return { data: res.data?.data as Topic[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const createTopic = useCallback(async (data: {
    title: string;
    description?: string;
    requirements?: string;
    tags?: string[];
    maxSlots?: number;
    semesterId: number | string;
  }): Promise<BaseResponse<Topic>> => {
    try {
      const res = await api.post(TOPICS_PATH, data);
      return { data: res.data?.data as Topic, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const updateTopic = useCallback(async (
    id: number | string,
    data: Partial<Topic>
  ): Promise<{ data: Topic | null; error: string | null }> => {
    try {
      const res = await api.put(`${TOPICS_PATH}/${id}`, data);
      return { data: res.data?.data as Topic, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const deleteTopic = useCallback(async (id: number | string): Promise<{ error: string | null }> => {
    try {
      await api.delete(`${TOPICS_PATH}/${id}`);
      return { error: null };
    } catch (e) {
      return { error: handleApiError(e) };
    }
  }, [api]);


  // Applications
  const getApplications = useCallback(async (): Promise<BaseResponse<TopicApplication[]>> => {
    try {
      const res = await api.get(APPLICATIONS_PATH);
      return { data: res.data as TopicApplication[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getApplicationsByTeacher = useCallback(async (semesterId: number | string): Promise<BaseResponse<TopicApplication[]>> => {
    try {
      const res = await api.get(`${APPLICATIONS_PATH}/teacher/me/${semesterId}`);
      return { data: res.data?.data as TopicApplication[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getMyApplications = useCallback(async (semesterId: number | string): Promise<BaseResponse<TopicApplication[]>> => {
    try {
      const res = await api.get(`${APPLICATIONS_PATH}/student/me/${semesterId}`);
      return { data: res.data?.data as TopicApplication[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getApplicationById = useCallback(async (id: number | string): Promise<BaseResponse<TopicApplication>> => {
    try {
      const res = await api.get(`${APPLICATIONS_PATH}/${id}`);
      return { data: res.data as TopicApplication, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const applyToTopic = useCallback(async (
    topicId: number | string,
    data: { proposalTitle: string; proposalAbstract: string }
  ): Promise<BaseResponse<TopicApplication>> => {
    try {
      const res = await api.post(`${TOPICS_PATH}/${topicId}/apply`, data);
      return { data: res.data as TopicApplication, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const updateApplication = useCallback(async (
    id: number | string,
    data: Partial<TopicApplication>
  ): Promise<BaseResponse<TopicApplication>> => {
    try {
      const res = await api.put(`${APPLICATIONS_PATH}/${id}`, data);
      return { data: res.data as TopicApplication, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const updateApplicationStatus = useCallback(async (
    id: number | string,
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled',
    note?: string | null
  ): Promise<BaseResponse<TopicApplication>> => {
    try {
      const res = await api.patch(`${APPLICATIONS_PATH}/${id}/status`, { status, note });
      return { data: res.data as TopicApplication, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const cancelApplication = useCallback(async (id: number | string): Promise<BaseResponse<TopicApplication>> => {
    try {
      const res = await api.patch(`${APPLICATIONS_PATH}/${id}/cancel`);
      return { data: res.data as TopicApplication, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  // Pre-Thesis main
  const getPreTheses = useCallback(async (): Promise<BaseResponse<PreThesis[]>> => {
    try {
      const res = await api.get(PRETHESIS_PATH);
      return { data: res.data as PreThesis[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getPreThesesByStudent = useCallback(async (): Promise<BaseResponse<PreThesis[]>> => {
    try {
      const res = await api.get(`${PRETHESIS_PATH}/student/me`);
      return { data: res.data?.data as PreThesis[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getPreThesisById = useCallback(async (id: number | string): Promise<BaseResponse<PreThesis>> => {
    try {
      const res = await api.get(`${PRETHESIS_PATH}/${id}`);
      return { data: res.data?.data as PreThesis, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getPreThesisForStudentAndSemester = useCallback(async (semesterId: number | string): Promise<BaseResponse<PreThesis | null>> => {
    try {
      const res = await api.get(`${PRETHESIS_PATH}/student/me/semester/${semesterId}`);
      return { data: res.data?.data as PreThesis | null, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getPreThesesForTeacherBySemester = useCallback(async (semesterId: number | string): Promise<BaseResponse<PreThesis[]>> => {
    try {
      const res = await api.get(`${PRETHESIS_PATH}/teacher/me/${semesterId}`);
      return { data: res.data?.data as PreThesis[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getPreThesesForAdministratorBySemester = useCallback(async (semesterId: number | string): Promise<BaseResponse<PreThesis[]>> => {
    try {
      const res = await api.get(`${PRETHESIS_PATH}/administrator/me/${semesterId}`);
      return { data: res.data?.data as PreThesis[], error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const updatePreThesisStatus = useCallback(async (
    id: number | string,
    status: string
  ): Promise<BaseResponse<PreThesis>> => {
    try {
      const res = await api.patch(`${PRETHESIS_PATH}/${id}/status`, { status });
      return { data: res.data as PreThesis, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const gradePreThesis = useCallback(async (
    id: number | string,
    gradeData: PreThesisGrade
  ): Promise<BaseResponse<PreThesis>> => {
    try {
      const res = await api.patch(`${PRETHESIS_PATH}/${id}/grade`, gradeData);
      return { data: res.data as PreThesis, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  // Stats
  const getPreThesisStats = useCallback(async (
    semesterId: number | string
  ): Promise<BaseResponse<PreThesisStats>> => {
    try {
      const res = await api.get(`${STATS_PATH}/pretheses/${semesterId}`);
      return { data: res.data as PreThesisStats, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const getApplicationStats = useCallback(async (
    semesterId: number | string
  ): Promise<BaseResponse<ApplicationStats>> => {
    try {
      const res = await api.get(`${STATS_PATH}/applications/${semesterId}`);
      return { data: res.data as ApplicationStats, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

// GET /api/pre-thesis/stats/outcomes
const getOutcomeStats = useCallback(async (): Promise<BaseResponse<any[]>> => {
  try {
    const res = await api.get(`${STATS_PATH}/outcomes`);
    const responseData = res.data?.data || res.data;
    return { data: responseData, error: null };
  } catch (e) {
    return { data: null, error: handleApiError(e) };
  }
}, [api]);

// GET /api/pre-thesis/stats/grades
const getGradeStats = useCallback(async (): Promise<BaseResponse<any[]>> => {
  try {
    const res = await api.get(`${STATS_PATH}/grades`);
    const responseData = res.data?.data || res.data;
    return { data: responseData, error: null };
  } catch (e) {
    return { data: null, error: handleApiError(e) };
  }
}, [api]);

  // Report
  const generatePreThesisReport = useCallback(async (
    preThesisId: number | string
  ): Promise<BaseResponse<Blob>> => {
    try {
      const res = await api.get(`${REPORTS_PATH}/${preThesisId}`, {
        responseType: 'blob'
      });
      return { data: res.data as Blob, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [api]);

  const downloadPreThesisReport = useCallback(async (
    preThesisId: number | string,
    fileName?: string
  ): Promise<BaseResponse<boolean>> => {
    try {
      const { data, error } = await generatePreThesisReport(preThesisId);
      if (error || !data) {
        return { data: null, error: error || 'Failed to generate report' };
      }
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `pre-thesis-report-${preThesisId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      return { data: true, error: null };
    } catch (e) {
      return { data: null, error: handleApiError(e) };
    }
  }, [generatePreThesisReport]);

  return useMemo(() => ({
    // Topics
    getTopics,
    getTopicById,
    getTopicsBySemester,
    getOwnTopicsInActiveSemester,
    createTopic,
    deleteTopic,
    updateTopic,
    getTopicsWithSlots,
    // Applications
    getApplications,
    getApplicationsByTeacher,
    getApplicationById,
    applyToTopic,
    updateApplication,
    updateApplicationStatus,
    cancelApplication,
    getMyApplications,
    // Pre-Thesis core
    getPreTheses,
    getPreThesesByStudent,
    getPreThesisById,
    getPreThesisForStudentAndSemester,
    getPreThesesForTeacherBySemester,
    getPreThesesForAdministratorBySemester,
    updatePreThesisStatus,
    gradePreThesis,
    // Stats
    getPreThesisStats,
    getApplicationStats,
    getOutcomeStats,
    getGradeStats,
    // Reports
    generatePreThesisReport,
    downloadPreThesisReport
  }), [
    getTopics,
    getTopicById,
    getTopicsBySemester,
    getOwnTopicsInActiveSemester,
    createTopic,
    deleteTopic,
    updateTopic,
    getTopicsWithSlots,
    getApplications,
    getApplicationsByTeacher,
    getApplicationById,
    applyToTopic,
    updateApplication,
    updateApplicationStatus,
    cancelApplication,
    getMyApplications,
    getPreTheses,
    getPreThesesByStudent,
    getPreThesisById,
    getPreThesisForStudentAndSemester,
    getPreThesesForTeacherBySemester,
    getPreThesesForAdministratorBySemester,
    updatePreThesisStatus,
    gradePreThesis,
    getPreThesisStats,
    getApplicationStats,
    getOutcomeStats,
    getGradeStats,
    generatePreThesisReport,
    downloadPreThesisReport
  ]);
};