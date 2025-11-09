import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useMemo } from 'react';

// Base API instance without authentication
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
});

export const useAuthenticatedApi = () => {
  const { getAccessTokenSilently, logout } = useAuth0();
  const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

  // Create the axios instance once per baseURL
  const authApi = useMemo(() => axios.create({ baseURL }), [baseURL]);

  // Attach interceptors once, and clean up on deps change/unmount
  useEffect(() => {
    const reqId = authApi.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          const token = await getAccessTokenSilently();
          if (token) {
            config.headers = config.headers || {};
              if (typeof (config.headers as any).set === 'function') {
              (config.headers as any).set('Authorization', `Bearer ${token}`);
            } else {
              (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
            }
          }
          return config;
        } catch (error) {
          console.error('Error getting access token, aborting request', error);
          return Promise.reject(error);
        }
      },
      (error) => Promise.reject(error)
    );

    const resId = authApi.interceptors.response.use(
      (response) => response,
      (error) => {
        const { response } = error;

        if (response) {
          if (response.status === 401) {
            console.log('Session expired, logging out user');
            logout({
              logoutParams: { returnTo: window.location.origin },
            });
            return Promise.reject(new Error('Your session has expired. Please log in again.'));
          }

          if (response.status === 403) {
            return Promise.reject(new Error('You do not have permission to perform this action.'));
          }

          if (response.status === 404) {
            return Promise.reject(new Error('The requested resource was not found.'));
          }

          if (response.status >= 500) {
            return Promise.reject(new Error('A server error occurred. Please try again later.'));
          }

          const errorMessage = response.data?.message || 'An unexpected error occurred';
          return Promise.reject(new Error(errorMessage));
        }

        if (error.request) {
          return Promise.reject(new Error('Network error. Please check your connection.'));
        }

        return Promise.reject(error);
      }
    );

    return () => {
      authApi.interceptors.request.eject(reqId);
      authApi.interceptors.response.eject(resId);
    };
  }, [authApi, getAccessTokenSilently, logout]);

  return authApi;
};