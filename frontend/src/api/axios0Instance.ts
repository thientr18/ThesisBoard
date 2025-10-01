import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

// Base API instance without authentication
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
});

// Hook to get authenticated API instance
export const useAuthenticatedApi = () => {
  const { getAccessTokenSilently } = useAuth0();
  
  const authApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  });

  authApi.interceptors.request.use(async (config) => {
    try {
      const token = await getAccessTokenSilently();
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Error getting access token', error);
    }
    return config;
  });
  
  return authApi;
};