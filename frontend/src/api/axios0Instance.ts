import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

// Base API instance without authentication
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
});

// Hook to get authenticated API instance
export const useAuthenticatedApi = () => {
  const { getAccessTokenSilently, logout } = useAuth0();
  
  const authApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  });

  authApi.interceptors.request.use(function(config) {
    const promise = new Promise((resolve) => {
      getAccessTokenSilently()
        .then(token => {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
          resolve(config);
        })
        .catch(error => {
          console.error('Error getting access token', error);
          resolve(config);
        });
    });
    
    return promise as unknown as typeof config;
  });

  authApi.interceptors.response.use(
    (response) => response,
    (error) => {
      const { response } = error;
      
      if (response) {
        // Authentication errors
        if (response.status === 401) {
          // Token expired or invalid - redirect to login
          logout({ 
            logoutParams: {
              returnTo: window.location.origin
            }
          });
          return Promise.reject(new Error('Your session has expired. Please log in again.'));
        }
        
        // Authorization errors
        if (response.status === 403) {
          return Promise.reject(new Error('You do not have permission to perform this action.'));
        }
        
        // Not found errors
        if (response.status === 404) {
          return Promise.reject(new Error('The requested resource was not found.'));
        }
        
        // Server errors
        if (response.status >= 500) {
          return Promise.reject(new Error('A server error occurred. Please try again later.'));
        }
        
        // Get error message from the API if available
        const errorMessage = response.data?.message || 'An unexpected error occurred';
        return Promise.reject(new Error(errorMessage));
      }
      
      // Network errors (no response)
      if (error.request) {
        return Promise.reject(new Error('Network error. Please check your connection.'));
      }
      
      // Unknown errors
      return Promise.reject(error);
    }
  );

  return authApi;
};