import { api } from '../config';
import type { ApiResponse, Announcement, CreateAnnouncementRequest, UpdateAnnouncementRequest } from '../../types/announcement.types';

const BASE_PATH = '/api/announcements';

// Helper function to handle API responses consistently
const handleApiResponse = async <T>(apiCall: Promise<any>): Promise<ApiResponse<T>> => {
  try {
    const response = await apiCall;
    return { data: response.data, error: null };
  } catch (error) {
    console.error('API Error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

export const AnnouncementAPI = {
  // Get all announcements
  getAll: async (): Promise<ApiResponse<Announcement[]>> => {
    return handleApiResponse<Announcement[]>(api.get(BASE_PATH) as Promise<any>);
  },

  // Get announcement slides
  getSlides: async (): Promise<ApiResponse<Announcement[]>> => {
    return handleApiResponse<Announcement[]>(api.get(`${BASE_PATH}/slide`) as Promise<any>);
  },

  // Get public announcement slides
  getPublicSlides: async (): Promise<ApiResponse<Announcement[]>> => {
    return handleApiResponse<Announcement[]>(api.get(`${BASE_PATH}/public`) as Promise<any>);
  },

  // Get announcement by ID
  getById: async (id: number): Promise<ApiResponse<Announcement>> => {
    return handleApiResponse<Announcement>(api.get(`${BASE_PATH}/${id}`) as Promise<any>);
  },

  // Create a new announcement
  create: async (payload: CreateAnnouncementRequest): Promise<ApiResponse<Announcement>> => {
    return handleApiResponse<Announcement>(api.post(BASE_PATH, payload) as Promise<any>);
  },

  // Update an existing announcement
  update: async (id: number, payload: UpdateAnnouncementRequest): Promise<ApiResponse<Announcement>> => {
    return handleApiResponse<Announcement>(api.put(`${BASE_PATH}/${id}`, payload) as Promise<any>);
  },

  // Delete an announcement
  delete: async (id: number): Promise<ApiResponse<void>> => {
    return handleApiResponse<void>(api.delete(`${BASE_PATH}/${id}`) as Promise<any>);
  },
};