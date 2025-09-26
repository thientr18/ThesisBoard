import { api } from './axios0Instance';

export const fetchUsers = async () => {
  try {
    const response = await api.get('/api/protected');
    return response.data;
  } catch (error) {
    console.error('Error fetching protected data:', error);
    throw error;
  }
};

export const fetchPublicData = async () => {
  try {
    const response = await api.get('/api/public');
    return response.data;
  } catch (error) {
    console.error('Error fetching public data:', error);
    throw error;
  }
};