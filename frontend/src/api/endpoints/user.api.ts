import { useCallback, useMemo } from 'react';
import { useAuthenticatedApi } from '../config';
import type { 
  ApiResponse,
  User,
  UserWithRoles,
  UserStatistics,
  CreateUserRequest,
  UpdateUserRequest,
  AssignRoleRequest,
  SearchUsersParams,
  StudentDetails,
  TeacherDetails
} from '../../types/user.types';

const BASE_PATH = '/api/users';

export const useUserApi = () => {
  const authApi = useAuthenticatedApi();

  const getMe = useCallback(async (): Promise<ApiResponse<UserWithRoles>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/me`);
      const user = (response.data.user ?? null) as UserWithRoles;
      return { data: user, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch current user' };
    }
  }, [authApi]);

  const getAll = useCallback(async (): Promise<ApiResponse<User[]>> => {
    try {
      const response = await authApi.get(BASE_PATH);
      return { data: response.data as User[], error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch users' };
    }
  }, [authApi]);

  const getById = useCallback(async (id: number): Promise<ApiResponse<User>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/${id}`);
      return { data: response.data as User, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to fetch user with ID ${id}` };
    }
  }, [authApi]);

  const create = useCallback(async (payload: CreateUserRequest): Promise<ApiResponse<User>> => {
    try {
      const response = await authApi.post(BASE_PATH, payload);
      return { data: response.data as User, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create user' };
    }
  }, [authApi]);

  const update = useCallback(async (id: number, payload: UpdateUserRequest): Promise<ApiResponse<User>> => {
    try {
      const response = await authApi.put(`${BASE_PATH}/${id}`, payload);
      return { data: response.data as User, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to update user with ID ${id}` };
    }
  }, [authApi]);

  const deleteOne = useCallback(async (id: number): Promise<ApiResponse<boolean>> => {
    try {
      await authApi.delete(`${BASE_PATH}/${id}`);
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to delete user with ID ${id}` };
    }
  }, [authApi]);

  const search = useCallback(async (params: SearchUsersParams): Promise<ApiResponse<User[]>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/search`, { params });
      return { data: response.data as User[], error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to search users' };
    }
  }, [authApi]);

  const getStatistics = useCallback(async (): Promise<ApiResponse<UserStatistics>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/statistics`);
      return { data: response.data as UserStatistics, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch user statistics' };
    }
  }, [authApi]);

  const getByRole = useCallback(async (roleName: string): Promise<ApiResponse<User[]>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/role/${roleName}`);
      return { data: response.data as User[], error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to fetch users with role ${roleName}` };
    }
  }, [authApi]);

  const activate = useCallback(async (id: number): Promise<ApiResponse<User>> => {
    try {
      const response = await authApi.patch(`${BASE_PATH}/${id}/activate`);
      return { data: response.data as User, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to activate user with ID ${id}` };
    }
  }, [authApi]);

  const deactivate = useCallback(async (id: number): Promise<ApiResponse<User>> => {
    try {
      const response = await authApi.patch(`${BASE_PATH}/${id}/deactivate`);
      return { data: response.data as User, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to deactivate user with ID ${id}` };
    }
  }, [authApi]);

  const getUserWithRoles = useCallback(async (id: number): Promise<ApiResponse<UserWithRoles>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/${id}/roles`);
      return { data: response.data as UserWithRoles, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to fetch roles for user with ID ${id}` };
    }
  }, [authApi]);

  const assignRole = useCallback(async (payload: AssignRoleRequest): Promise<ApiResponse<boolean>> => {
    try {
      await authApi.post(`${BASE_PATH}/roles`, payload);
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to assign role to user' };
    }
  }, [authApi]);

  const removeRole = useCallback(async (payload: AssignRoleRequest): Promise<ApiResponse<boolean>> => {
    try {
      await authApi.delete(`${BASE_PATH}/roles`, { data: payload } as any);
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to remove role from user' };
    }
  }, [authApi]);

  const getStudentById = useCallback(async (id: number): Promise<ApiResponse<StudentDetails>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/student/${id}/`);
      return { data: response.data.student as StudentDetails, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to fetch student with ID ${id}` };
    }
  }, [authApi]);

  const getTeacherById = useCallback(async (id: number): Promise<ApiResponse<TeacherDetails>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/teacher/${id}`);
      return { data: response.data.teacher as TeacherDetails, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to fetch teacher with ID ${id}` };
    }
  }, [authApi]);

  return useMemo(() => ({
    getMe,
    getAll,
    getById,
    create,
    update,
    delete: deleteOne,
    search,
    getStatistics,
    getByRole,
    activate,
    deactivate,
    getUserWithRoles,
    assignRole,
    removeRole,
    getStudentById,
    getTeacherById,
  }), [
    getMe,
    getAll,
    getById,
    create,
    update,
    deleteOne,
    search,
    getStatistics,
    getByRole,
    activate,
    deactivate,
    getUserWithRoles,
    assignRole,
    removeRole,
    getStudentById,
    getTeacherById,
  ]);
};