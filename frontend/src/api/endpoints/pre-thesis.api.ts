import axios from 'axios';
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

// Create pre-thesis API instance
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_BASE_PATH = `${apiUrl}/api/pre-theses`;

// Helper function to get authorization header
const getAuthHeader = () => {
  const token = localStorage.getItem('auth_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Topics API
export const getTopics = async (): Promise<BaseResponse<Topic[]>> => {
  try {
    const response = await axios.get<Topic[]>(`${API_BASE_PATH}/topics`, {
      headers: getAuthHeader()
    });
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error('Error fetching topics:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to fetch topics'
    };
  }
};

export const getTopicById = async (id: number | string): Promise<BaseResponse<Topic>> => {
  try {
    const response = await axios.get<Topic>(`${API_BASE_PATH}/topics/${id}`, {
      headers: getAuthHeader()
    });
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error(`Error fetching topic ${id}:`, error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to fetch topic'
    };
  }
};

// Applications API
export const getApplications = async (): Promise<BaseResponse<TopicApplication[]>> => {
  try {
    const response = await axios.get<TopicApplication[]>(`${API_BASE_PATH}/applications`, {
      headers: getAuthHeader()
    });
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to fetch applications'
    };
  }
};

export const getApplicationById = async (id: number | string): Promise<BaseResponse<TopicApplication>> => {
  try {
    const response = await axios.get<TopicApplication>(`${API_BASE_PATH}/applications/${id}`, {
      headers: getAuthHeader()
    });
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error(`Error fetching application ${id}:`, error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to fetch application'
    };
  }
};

export const applyToTopic = async (
  topicId: number | string, 
  studentId: number | string, 
  motivation?: string
): Promise<BaseResponse<TopicApplication>> => {
  try {
    const response = await axios.post<TopicApplication>(
      `${API_BASE_PATH}/topics/${topicId}/applications/${studentId}`,
      { motivation },
      { headers: getAuthHeader() }
    );
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error('Error applying to topic:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to apply to topic'
    };
  }
};

export const updateApplicationStatus = async (
  id: number | string, 
  status: string
): Promise<BaseResponse<TopicApplication>> => {
  try {
    const response = await axios.patch<TopicApplication>(
      `${API_BASE_PATH}/applications/${id}/status`,
      { status },
      { headers: getAuthHeader() }
    );
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error(`Error updating application status:`, error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to update application status'
    };
  }
};

export const cancelApplication = async (id: number | string): Promise<BaseResponse<TopicApplication>> => {
  try {
    const response = await axios.post<TopicApplication>(
      `${API_BASE_PATH}/applications/${id}/cancel`,
      {},
      { headers: getAuthHeader() }
    );
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error(`Error canceling application:`, error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to cancel application'
    };
  }
};

// Pre-Thesis API
export const getPreTheses = async (): Promise<BaseResponse<PreThesis[]>> => {
  try {
    const response = await axios.get<PreThesis[]>(`${API_BASE_PATH}/pretheses`, {
      headers: getAuthHeader()
    });
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error('Error fetching pre-theses:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to fetch pre-theses'
    };
  }
};

export const getPreThesisById = async (id: number | string): Promise<BaseResponse<PreThesis>> => {
  try {
    const response = await axios.get<PreThesis>(`${API_BASE_PATH}/pretheses/${id}`, {
      headers: getAuthHeader()
    });
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error(`Error fetching pre-thesis ${id}:`, error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to fetch pre-thesis'
    };
  }
};

export const createPreThesis = async (preThesisData: CreatePreThesisRequest): Promise<BaseResponse<PreThesis>> => {
  try {
    // If there are attachments, use FormData
    if (preThesisData.attachments && preThesisData.attachments.length > 0) {
      const formData = new FormData();
      
      // Append basic data
      formData.append('title', preThesisData.title);
      formData.append('description', preThesisData.description);
      formData.append('studentId', String(preThesisData.studentId));
      formData.append('semesterId', String(preThesisData.semesterId));
      
      // Append attachments
      preThesisData.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
      
      const response = await axios.post<PreThesis>(
        `${API_BASE_PATH}/pretheses`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return {
        data: response.data,
        error: null
      };
    } else {
      // No attachments, use regular JSON
      const response = await axios.post<PreThesis>(
        `${API_BASE_PATH}/pretheses`,
        preThesisData,
        { headers: getAuthHeader() }
      );
      
      return {
        data: response.data,
        error: null
      };
    }
  } catch (error: any) {
    console.error('Error creating pre-thesis:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to create pre-thesis'
    };
  }
};

export const updatePreThesisStatus = async (
  id: number | string, 
  status: string
): Promise<BaseResponse<PreThesis>> => {
  try {
    const response = await axios.patch<PreThesis>(
      `${API_BASE_PATH}/pretheses/${id}/status`,
      { status },
      { headers: getAuthHeader() }
    );
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error(`Error updating pre-thesis status:`, error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to update pre-thesis status'
    };
  }
};

export const gradePreThesis = async (
  id: number | string, 
  gradeData: PreThesisGrade
): Promise<BaseResponse<PreThesis>> => {
  try {
    const response = await axios.post<PreThesis>(
      `${API_BASE_PATH}/pretheses/${id}/grade`,
      gradeData,
      { headers: getAuthHeader() }
    );
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error(`Error grading pre-thesis:`, error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to grade pre-thesis'
    };
  }
};

export const cancelPreThesis = async (id: number | string): Promise<BaseResponse<PreThesis>> => {
  try {
    const response = await axios.post<PreThesis>(
      `${API_BASE_PATH}/pretheses/${id}/cancel`,
      {},
      { headers: getAuthHeader() }
    );
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error(`Error canceling pre-thesis:`, error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to cancel pre-thesis'
    };
  }
};

// Statistics API
export const getPreThesisStats = async (semesterId: number | string): Promise<BaseResponse<PreThesisStats>> => {
  try {
    const response = await axios.get<PreThesisStats>(
      `${API_BASE_PATH}/stats/pretheses/${semesterId}`,
      { headers: getAuthHeader() }
    );
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error(`Error fetching pre-thesis statistics:`, error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to fetch pre-thesis statistics'
    };
  }
};

export const getApplicationStats = async (semesterId: number | string): Promise<BaseResponse<ApplicationStats>> => {
  try {
    const response = await axios.get<ApplicationStats>(
      `${API_BASE_PATH}/stats/applications/${semesterId}`,
      { headers: getAuthHeader() }
    );
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error(`Error fetching application statistics:`, error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to fetch application statistics'
    };
  }
};

// Report API
export const generatePreThesisReport = async (preThesisId: number | string): Promise<BaseResponse<Blob>> => {
  try {
    const response = await axios.get(
      `${API_BASE_PATH}/reports/evaluation/${preThesisId}`,
      {
        headers: getAuthHeader(),
        responseType: 'blob' // Important for downloading files
      }
    );
    
    return {
      data: response.data as Blob,
      error: null
    };
  } catch (error: any) {
    console.error(`Error generating pre-thesis report:`, error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to generate pre-thesis report'
    };
  }
};

// Utility function to download the generated report
export const downloadPreThesisReport = async (preThesisId: number | string, fileName?: string): Promise<BaseResponse<boolean>> => {
  try {
    const { data, error } = await generatePreThesisReport(preThesisId);
    
    if (error || !data) {
      throw new Error(error || 'Failed to generate report');
    }
    
    // Create blob URL and trigger download
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || `pre-thesis-report-${preThesisId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return {
      data: true,
      error: null
    };
  } catch (error: any) {
    console.error(`Error downloading pre-thesis report:`, error);
    return {
      data: null,
      error: error.message || 'Failed to download pre-thesis report'
    };
  }
};