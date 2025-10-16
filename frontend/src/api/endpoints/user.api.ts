import { api } from '../config';

export const fetchPublicData = async () => {
  try {
    const response = await api.get('/api/public');
    return response.data;
  } catch (error) {
    console.error('Error fetching public data:', error);
    throw error;
  }
};

export const fetchProtectedData = async (getToken: () => Promise<string>) => {
  try {
    const token = await getToken();
    const response = await api.get('/api/protected', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching protected data:', error);
    throw error;
  }
};

export const fetchUsers = fetchProtectedData;