import { useCallback, useMemo } from 'react';
import { useAuthenticatedApi } from '../config';
import type {
  BaseResponse,
  Topic,
  TopicApplication,
  PreThesis,
  PreThesisGrade,
  PreThesisStats,
  ApplicationStats
} from '../../types/pre-thesis.types';

const BASE = '/api/pre-theses';
const TOPICS_PATH = `${BASE}/topics`;
const APPLICATIONS_PATH = `${BASE}/applications`;
const PRETHESIS_PATH = `${BASE}/pretheses`;
const STATS_PATH = `${BASE}/stats`;
const REPORTS_PATH = `${BASE}/reports`;

const handleError = (e: unknown, fallback: string): string => {
  if (e && typeof e === 'object' && 'response' in e) {
    const anyErr = e as any;
    return anyErr.response?.data?.message || fallback;
  }
  if (e instanceof Error) return e.message;
  return fallback;
};

export const usePreThesisApi = () => {
  const api = useAuthenticatedApi();

  // Topics
  const getTopics = useCallback(async (): Promise<BaseResponse<Topic[]>> => {
    try {
      const res = await api.get(TOPICS_PATH);
      return { data: res.data?.data as Topic[], error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch topics') };
    }
  }, [api]);

  const getTopicsBySemester = useCallback(async (semesterId: number | string): Promise<BaseResponse<Topic[]>> => {
    try {
      const res = await api.get(`${TOPICS_PATH}/semester/${semesterId}`);
      return { data: res.data?.data as Topic[], error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch topics for semester') };
    }
  }, [api]);

  const getTopicById = useCallback(async (id: number | string): Promise<BaseResponse<Topic>> => {
    try {
      const res = await api.get(`${TOPICS_PATH}/${id}`);
      return { data: res.data?.data as Topic, error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch topic') };
    }
  }, [api]);

  const getTopicsWithSlots = useCallback(async (semesterId?: number | string): Promise<BaseResponse<Topic[]>> => {
    try {
      const res = await api.get(`${TOPICS_PATH}/with-slots`, { params: { semesterId } });
      return { data: res.data?.data as Topic[], error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch topics with slots') };
    }
  }, [api]);

  const getOwnTopicsInActiveSemester = useCallback(async (semesterId?: number | string): Promise<BaseResponse<Topic[]>> => {
    try {
      const res = await api.get(`${TOPICS_PATH}/active-semester/own`, { params: { semesterId } });
      return { data: res.data?.data as Topic[], error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch own topics in active semester') };
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
      return { data: null, error: handleError(e, 'Failed to create topic') };
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
      return { data: null, error: handleError(e, 'Failed to update topic') };
    }
  }, [api]);

  const deleteTopic = useCallback(async (id: number | string): Promise<{ error: string | null }> => {
    try {
      await api.delete(`${TOPICS_PATH}/${id}`);
      return { error: null };
    } catch (e) {
      return { error: handleError(e, 'Failed to delete topic') };
    }
  }, [api]);


  // Applications
  const getApplications = useCallback(async (): Promise<BaseResponse<TopicApplication[]>> => {
    try {
      const res = await api.get(APPLICATIONS_PATH);
      return { data: res.data as TopicApplication[], error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch applications') };
    }
  }, [api]);

  const getApplicationsByTeacher = useCallback(async (semesterId: number | string): Promise<BaseResponse<TopicApplication[]>> => {
    try {
      const res = await api.get(`${APPLICATIONS_PATH}/teacher/me/${semesterId}`);
      return { data: res.data?.data as TopicApplication[], error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch applications for teacher') };
    }
  }, [api]);

  const getMyApplications = useCallback(async (semesterId: number | string): Promise<BaseResponse<TopicApplication[]>> => {
    try {
      const res = await api.get(`${APPLICATIONS_PATH}/student/me/${semesterId}`);
      return { data: res.data?.data as TopicApplication[], error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch own applications') };
    }
  }, [api]);

  const getApplicationById = useCallback(async (id: number | string): Promise<BaseResponse<TopicApplication>> => {
    try {
      const res = await api.get(`${APPLICATIONS_PATH}/${id}`);
      return { data: res.data as TopicApplication, error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch application') };
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
      return { data: null, error: handleError(e, 'Failed to apply to topic') };
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
      return { data: null, error: handleError(e, 'Failed to update application') };
    }
  }, [api]);

  const updateApplicationStatus = useCallback(async (
    id: number | string,
    status: string,
    note?: string | null
  ): Promise<BaseResponse<TopicApplication>> => {
    try {
      const res = await api.patch(`${APPLICATIONS_PATH}/${id}/status`, { status, note });
      return { data: res.data as TopicApplication, error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to update application status') };
    }
  }, [api]);

  const cancelApplication = useCallback(async (id: number | string): Promise<BaseResponse<TopicApplication>> => {
    try {
      const res = await api.patch(`${APPLICATIONS_PATH}/${id}/cancel`);
      return { data: res.data as TopicApplication, error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to cancel application') };
    }
  }, [api]);

  // Pre-Thesis main
  const getPreTheses = useCallback(async (): Promise<BaseResponse<PreThesis[]>> => {
    try {
      const res = await api.get(PRETHESIS_PATH);
      return { data: res.data as PreThesis[], error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch pre-theses') };
    }
  }, [api]);

  const getPreThesesByStudent = useCallback(async (): Promise<BaseResponse<PreThesis[]>> => {
    try {
      const res = await api.get(`${PRETHESIS_PATH}/student/me`);
      return { data: res.data?.data as PreThesis[], error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch pre-theses by student') };
    }
  }, [api]);

  const getPreThesisById = useCallback(async (id: number | string): Promise<BaseResponse<PreThesis>> => {
    try {
      const res = await api.get(`${PRETHESIS_PATH}/${id}`);
      return { data: res.data?.data as PreThesis, error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch pre-thesis') };
    }
  }, [api]);

  const getPreThesesForTeacherBySemester = useCallback(async (semesterId: number | string): Promise<BaseResponse<PreThesis[]>> => {
    try {
      const res = await api.get(`${PRETHESIS_PATH}/teacher/me/${semesterId}`);
      return { data: res.data?.data as PreThesis[], error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch pre-theses for teacher by semester') };
    }
  }, [api]);

  const getPreThesesForAdministratorBySemester = useCallback(async (semesterId: number | string): Promise<BaseResponse<PreThesis[]>> => {
    try {
      const res = await api.get(`${PRETHESIS_PATH}/administrator/me/${semesterId}`);
      return { data: res.data?.data as PreThesis[], error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch pre-theses for administrator by semester') };
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
      return { data: null, error: handleError(e, 'Failed to update pre-thesis status') };
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
      return { data: null, error: handleError(e, 'Failed to grade pre-thesis') };
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
      return { data: null, error: handleError(e, 'Failed to fetch pre-thesis statistics') };
    }
  }, [api]);

  const getApplicationStats = useCallback(async (
    semesterId: number | string
  ): Promise<BaseResponse<ApplicationStats>> => {
    try {
      const res = await api.get(`${STATS_PATH}/applications/${semesterId}`);
      return { data: res.data as ApplicationStats, error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch application statistics') };
    }
  }, [api]);

  // Report
  const generatePreThesisReport = useCallback(async (
    preThesisId: number | string
  ): Promise<BaseResponse<Blob>> => {
    try {
      const res = await api.get(`${REPORTS_PATH}/evaluation/${preThesisId}`, {
        responseType: 'blob'
      });
      return { data: res.data as Blob, error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to generate pre-thesis report') };
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
      return { data: null, error: handleError(e, 'Failed to download pre-thesis report') };
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
    getPreThesesForTeacherBySemester,
    getPreThesesForAdministratorBySemester,
    updatePreThesisStatus,
    gradePreThesis,
    // Stats
    getPreThesisStats,
    getApplicationStats,
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
    getPreThesesForTeacherBySemester,
    getPreThesesForAdministratorBySemester,
    updatePreThesisStatus,
    gradePreThesis,
    getPreThesisStats,
    getApplicationStats,
    generatePreThesisReport,
    downloadPreThesisReport
  ]);
};