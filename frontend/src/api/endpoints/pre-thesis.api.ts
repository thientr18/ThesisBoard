import { useCallback, useMemo } from 'react';
import { useAuthenticatedApi } from '../config';
import type {
  BaseResponse,
  Topic,
  TopicApplication,
  PreThesis,
  PreThesisGrade,
  CreatePreThesisRequest,
  UpdatePreThesisRequest,
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
      return { data: res.data as Topic[], error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch topics') };
    }
  }, [api]);

  const getTopicById = useCallback(async (id: number | string): Promise<BaseResponse<Topic>> => {
    try {
      const res = await api.get(`${TOPICS_PATH}/${id}`);
      return { data: res.data as Topic, error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch topic') };
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
    studentId: number | string,
    motivation?: string
  ): Promise<BaseResponse<TopicApplication>> => {
    try {
      const res = await api.post(`${TOPICS_PATH}/${topicId}/applications/${studentId}`, { motivation });
      return { data: res.data as TopicApplication, error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to apply to topic') };
    }
  }, [api]);

  const updateApplicationStatus = useCallback(async (
    id: number | string,
    status: string
  ): Promise<BaseResponse<TopicApplication>> => {
    try {
      const res = await api.patch(`${APPLICATIONS_PATH}/${id}/status`, { status });
      return { data: res.data as TopicApplication, error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to update application status') };
    }
  }, [api]);

  const cancelApplication = useCallback(async (id: number | string): Promise<BaseResponse<TopicApplication>> => {
    try {
      const res = await api.post(`${APPLICATIONS_PATH}/${id}/cancel`);
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

  const getPreThesisById = useCallback(async (id: number | string): Promise<BaseResponse<PreThesis>> => {
    try {
      const res = await api.get(`${PRETHESIS_PATH}/${id}`);
      return { data: res.data as PreThesis, error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to fetch pre-thesis') };
    }
  }, [api]);

  const createPreThesis = useCallback(async (
    data: CreatePreThesisRequest
  ): Promise<BaseResponse<PreThesis>> => {
    try {
      if (data.attachments?.length) {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('studentId', String(data.studentId));
        formData.append('semesterId', String(data.semesterId));
        data.attachments.forEach(f => formData.append('attachments', f));
        const res = await api.post(PRETHESIS_PATH, formData);
        return { data: res.data as PreThesis, error: null };
      }
      const res = await api.post(PRETHESIS_PATH, data);
      return { data: res.data as PreThesis, error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to create pre-thesis') };
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
      const res = await api.post(`${PRETHESIS_PATH}/${id}/grade`, gradeData);
      return { data: res.data as PreThesis, error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to grade pre-thesis') };
    }
  }, [api]);

  const cancelPreThesis = useCallback(async (id: number | string): Promise<BaseResponse<PreThesis>> => {
    try {
      const res = await api.post(`${PRETHESIS_PATH}/${id}/cancel`);
      return { data: res.data as PreThesis, error: null };
    } catch (e) {
      return { data: null, error: handleError(e, 'Failed to cancel pre-thesis') };
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
    // Applications
    getApplications,
    getApplicationById,
    applyToTopic,
    updateApplicationStatus,
    cancelApplication,
    // Pre-Thesis core
    getPreTheses,
    getPreThesisById,
    createPreThesis,
    updatePreThesisStatus,
    gradePreThesis,
    cancelPreThesis,
    // Stats
    getPreThesisStats,
    getApplicationStats,
    // Reports
    generatePreThesisReport,
    downloadPreThesisReport
  }), [
    getTopics,
    getTopicById,
    getApplications,
    getApplicationById,
    applyToTopic,
    updateApplicationStatus,
    cancelApplication,
    getPreTheses,
    getPreThesisById,
    createPreThesis,
    updatePreThesisStatus,
    gradePreThesis,
    cancelPreThesis,
    getPreThesisStats,
    getApplicationStats,
    generatePreThesisReport,
    downloadPreThesisReport
  ]);
};