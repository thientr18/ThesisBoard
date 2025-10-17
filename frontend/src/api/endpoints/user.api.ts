import type { 
  ApiResponse,
  User,
  UserWithRoles,
  UserStatistics,
  CreateUserRequest,
  UpdateUserRequest,
  AssignRoleRequest,
  SearchUsersParams
} from '../../types/user.types';
import { useAuthenticatedApi } from '../config';

/**
 * Hook that provides API functions for user management
 * Must be used within React components or custom hooks
 */
export const useUserApi = () => {
  const authApi = useAuthenticatedApi();
  
  return {
    // Get all users
    getAll: async (): Promise<ApiResponse<User[]>> => {
      try {
        const response = await authApi.get('/api/users');
        return { data: response.data as User[], error: null };
      } catch (error: any) {
        return { data: null, error: error.message || 'Failed to fetch users' };
      }
    },

    // Get user by ID
    getById: async (id: number): Promise<ApiResponse<User>> => {
      try {
        const response = await authApi.get(`/api/users/${id}`);
        return { data: response.data as User, error: null };
      } catch (error: any) {
        return { data: null, error: error.message || `Failed to fetch user with ID ${id}` };
      }
    },

    // Create new user
    create: async (payload: CreateUserRequest): Promise<ApiResponse<User>> => {
      try {
        const response = await authApi.post('/api/users', payload);
        return { data: response.data as User, error: null };
      } catch (error: any) {
        return { data: null, error: error.message || 'Failed to create user' };
      }
    },

    // Update existing user
    update: async (id: number, payload: UpdateUserRequest): Promise<ApiResponse<User>> => {
      try {
        const response = await authApi.put(`/api/users/${id}`, payload);
        return { data: response.data as User, error: null };
      } catch (error: any) {
        return { data: null, error: error.message || `Failed to update user with ID ${id}` };
      }
    },

    // Delete user
    delete: async (id: number): Promise<ApiResponse<boolean>> => {
      try {
        await authApi.delete(`/api/users/${id}`);
        return { data: true, error: null };
      } catch (error: any) {
        return { data: null, error: error.message || `Failed to delete user with ID ${id}` };
      }
    },

    // Search users with filters
    search: async (params: SearchUsersParams): Promise<ApiResponse<User[]>> => {
      try {
        const response = await authApi.get('/api/users/search', { params });
        return { data: response.data as User[], error: null };
      } catch (error: any) {
        return { data: null, error: error.message || 'Failed to search users' };
      }
    },

    // Get user statistics
    getStatistics: async (): Promise<ApiResponse<UserStatistics>> => {
      try {
        const response = await authApi.get('/api/users/statistics');
        return { data: response.data as UserStatistics, error: null };
      } catch (error: any) {
        return { data: null, error: error.message || 'Failed to fetch user statistics' };
      }
    },

    // Get users by role
    getByRole: async (roleName: string): Promise<ApiResponse<User[]>> => {
      try {
        const response = await authApi.get(`/api/users/role/${roleName}`);
        return { data: response.data as User[], error: null };
      } catch (error: any) {
        return { data: null, error: error.message || `Failed to fetch users with role ${roleName}` };
      }
    },

    // Activate user
    activate: async (id: number): Promise<ApiResponse<User>> => {
      try {
        const response = await authApi.patch(`/api/users/${id}/activate`);
        return { data: response.data as User, error: null };
      } catch (error: any) {
        return { data: null, error: error.message || `Failed to activate user with ID ${id}` };
      }
    },

    // Deactivate user
    deactivate: async (id: number): Promise<ApiResponse<User>> => {
      try {
        const response = await authApi.patch(`/api/users/${id}/deactivate`);
        return { data: response.data as User, error: null };
      } catch (error: any) {
        return { data: null, error: error.message || `Failed to deactivate user with ID ${id}` };
      }
    },

    // Get user with roles
    getUserWithRoles: async (id: number): Promise<ApiResponse<UserWithRoles>> => {
      try {
        const response = await authApi.get(`/api/users/${id}/roles`);
        return { data: response.data as UserWithRoles, error: null };
      } catch (error: any) {
        return { data: null, error: error.message || `Failed to fetch roles for user with ID ${id}` };
      }
    },

    // Assign role to user
    assignRole: async (payload: AssignRoleRequest): Promise<ApiResponse<boolean>> => {
      try {
        await authApi.post('/api/users/roles', payload);
        return { data: true, error: null };
      } catch (error: any) {
        return { data: null, error: error.message || 'Failed to assign role to user' };
      }
    },

    // Remove role from user
    removeRole: async (payload: AssignRoleRequest): Promise<ApiResponse<boolean>> => {
      try {
        await authApi.delete('/api/users/roles', { data: payload } as any);
        return { data: true, error: null };
      } catch (error: any) {
        return { data: null, error: error.message || 'Failed to remove role from user' };
      }
    },
  };
};