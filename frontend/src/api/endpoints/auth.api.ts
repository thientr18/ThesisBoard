import axios from 'axios';
import type { 
  AuthTokens, 
  UserInfo, 
  AuthResponse 
} from '../../types/auth.types';

// Local storage keys
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const ID_TOKEN_KEY = 'auth_id_token';

// Auth0 configuration
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = import.meta.env.VITE_AUTH0_CLIENT_SECRET;
const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE;
const AUTH0_CONNECTION = import.meta.env.VITE_AUTH0_CONNECTION;

// Create Auth0-specific axios instance
const auth0Api = axios.create({
  baseURL: `https://${AUTH0_DOMAIN}`,
});

// Token storage functions
export const storeTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(ID_TOKEN_KEY, tokens.id_token);
  if (tokens.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  }
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ID_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getIdToken = (): string | null => {
  return localStorage.getItem(ID_TOKEN_KEY);
};

/**
 * Login user with email and password
 */
export const login = async (
  email: string, 
  password: string
): Promise<AuthResponse<AuthTokens>> => {
  try {
    const response = await auth0Api.post<AuthTokens>('/oauth/token', {
      grant_type: 'password',
      username: email,
      password,
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: AUTH0_AUDIENCE,
      scope: 'openid profile email offline_access'
    });
    
    storeTokens(response.data);
    
    return {
      data: response.data,
      error: null,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      data: null,
      error: error.response?.data?.error_description || 'Login failed. Please try again.',
    };
  }
};

/**
 * Sign up new user
 */
// export const signup = async (
//   email: string, 
//   password: string
// ): Promise<AuthResponse<{ email: string }>> => {
//   try {
//     const response = await auth0Api.post('/dbconnections/signup', {
//       client_id: AUTH0_CLIENT_ID,
//       email,
//       password,
//       connection: AUTH0_CONNECTION
//     });
    
//     return {
//       data: response.data as { email: string },
//       error: null,
//     };
//   } catch (error: any) {
//     console.error('Signup error:', error);
//     return {
//       data: null,
//       error: error.response?.data?.error_description || 'Signup failed. Please try again.',
//     };
//   }
// };

/**
 * Logout user
 */
export const logout = async (p0: { logoutParams: { returnTo: string; }; }): Promise<AuthResponse<boolean>> => {
  try {
    
    // Call Auth0 logout endpoint
    await auth0Api.get('/v2/logout', {
      params: {
        client_id: AUTH0_CLIENT_ID,
        returnTo: window.location.origin,
      }
    });
    
    // Clear tokens from localStorage
    clearTokens();
    
    return {
      data: true,
      error: null,
    };
  } catch (error: any) {
    console.error('Logout error:', error);
    
    // Still clear tokens locally even if API call fails
    clearTokens();
    
    return {
      data: true,
      error: 'Logout from server failed, but local session was cleared.',
    };
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (
  refreshToken?: string
): Promise<AuthResponse<AuthTokens>> => {
  try {
    const token = refreshToken || getRefreshToken();
    
    if (!token) {
      return {
        data: null,
        error: 'No refresh token available',
      };
    }
    
    const response = await auth0Api.post<AuthTokens>('/oauth/token', {
      grant_type: 'refresh_token',
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      refresh_token: token,
    });
    
    storeTokens(response.data);
    
    return {
      data: response.data,
      error: null,
    };
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return {
      data: null,
      error: error.response?.data?.error_description || 'Failed to refresh token.',
    };
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiryTime;
  } catch (error) {
    console.error('Token parsing error:', error);
    return true; // If we can't parse the token, assume it's expired
  }
};

/**
 * Check if user is authenticated with a valid token
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  return !!token && !isTokenExpired(token);
};

// Export token utilities
export const TokenService = {
  getAccessToken,
  getIdToken,
  getRefreshToken,
  storeTokens,
  clearTokens,
  isTokenExpired,
  isAuthenticated
};