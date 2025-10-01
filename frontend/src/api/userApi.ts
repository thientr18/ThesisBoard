import { api } from './axios0Instance';

// For public endpoints (no auth required)
export const fetchPublicData = async () => {
  try {
    const response = await api.get('/api/public');
    return response.data;
  } catch (error) {
    console.error('Error fetching public data:', error);
    throw error;
  }
};

// For protected endpoints (auth required)
// This should be used within components that have access to the useAuth0 hook
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

// Legacy function - you can adapt this to use the new approach
export const fetchUsers = fetchProtectedData;