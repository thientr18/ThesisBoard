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
  Student,
  Teacher
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

  const changeOwnPassword = useCallback(async (currentPassword: string, newPassword: string): Promise<ApiResponse<boolean>> => {
    try {
      await authApi.put(`${BASE_PATH}/change-password`, { currentPassword, newPassword });
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to change password' };
    }
  }, [authApi]);

  const getById = useCallback(async (id: number): Promise<ApiResponse<User>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/${id}`);
      return { data: response.data.user as User, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to fetch user with ID ${id}` };
    }
  }, [authApi]);

  const search = useCallback(async (params: SearchUsersParams): Promise<ApiResponse<User[]>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/search`, { params });
      return { data: response.data.users as User[], error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to search users' };
    }
  }, [authApi]);

  const getStatistics = useCallback(async (): Promise<ApiResponse<UserStatistics>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/statistics`);
      return { data: response.data.statistics as UserStatistics, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch user statistics' };
    }
  }, [authApi]);
  
  const activate = useCallback(async (id: number): Promise<ApiResponse<User>> => {
    try {
      await authApi.patch(`${BASE_PATH}/${id}/activate`);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to activate user with ID ${id}` };
    }
  }, [authApi]);

  const deactivate = useCallback(async (id: number): Promise<ApiResponse<User>> => {
    try {
      await authApi.patch(`${BASE_PATH}/${id}/deactivate`);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to deactivate user with ID ${id}` };
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

  

// Student APIs
  const createStudent = useCallback(async (payload: CreateUserRequest): Promise<ApiResponse<User>> => {
    try {
      const response = await authApi.post(`${BASE_PATH}/student`, payload);
      return { data: response.data.data as User, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create student' };
    }
  }, [authApi]);

  const getAllStudents = useCallback(async (): Promise<ApiResponse<Student[]>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/students`);
      return { data: response.data.students as Student[], error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch students' };
    }
  }, [authApi]);

  const getStudentById = useCallback(async (id: number): Promise<ApiResponse<Student>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/student/${id}`);
      return { data: response.data.student as Student, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to fetch student with ID ${id}` };
    }
  }, [authApi]);

  const updateStudent = useCallback(async (id: number, payload: UpdateUserRequest): Promise<ApiResponse<User>> => {
    try {
      const response = await authApi.put(`${BASE_PATH}/student/${id}`, payload);
      return { data: response.data.student as User, error: null }; 
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to update student with ID ${id}` };
    }
  }, [authApi]);

  const deleteStudent = useCallback(async (id: number): Promise<ApiResponse<boolean>> => {
    try {
      await authApi.delete(`${BASE_PATH}/student/${id}`);
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to delete student with ID ${id}` };
    }
  }, [authApi]);

  // Teacher APIs
  const createTeacher = useCallback(async (payload: CreateUserRequest): Promise<ApiResponse<User>> => {
    try {
      const response = await authApi.post(`${BASE_PATH}/teacher`, payload);
      return { data: response.data.data as User, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create teacher' };
    }
  }, [authApi]);

  const getAllTeachers = useCallback(async (): Promise<ApiResponse<Teacher[]>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/teachers`);
      console.log(response.data);
      return { data: response.data.teachers as Teacher[], error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch teachers' };
    }
  }, [authApi]);

  const getTeacherById = useCallback(async (id: number): Promise<ApiResponse<Teacher>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/teacher/${id}`);
      return { data: response.data.teacher as Teacher, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to fetch teacher with ID ${id}` };
    }
  }, [authApi]);

  const updateTeacher = useCallback(async (id: number, payload: UpdateUserRequest): Promise<ApiResponse<User>> => {
    try {
      const response = await authApi.put(`${BASE_PATH}/teacher/${id}`, payload);
      return { data: response.data.data as User, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to update teacher with ID ${id}` };
    }
  }, [authApi]);

  const deleteTeacher = useCallback(async (id: number): Promise<ApiResponse<boolean>> => {
    try {
      await authApi.delete(`${BASE_PATH}/teacher/${id}`);
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to delete teacher with ID ${id}` };
    }
  }, [authApi]);

  // Administrator APIs
  const createAdministrator = useCallback(async (payload: CreateUserRequest): Promise<ApiResponse<User>> => {
    try {
      const response = await authApi.post(`${BASE_PATH}/administrator`, payload);
      return { data: response.data.data as User, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create administrator' };
    }
  }, [authApi]);

  const getAllAdministrators = useCallback(async (): Promise<ApiResponse<User[]>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/administrators`);
      return { data: response.data.administrators as User[], error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch administrators' };
    }
  }, [authApi]);

  const getAdministratorById = useCallback(async (id: number): Promise<ApiResponse<User>> => {
    try {
      const response = await authApi.get(`${BASE_PATH}/administrator/${id}`);
      return { data: response.data.user as User, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to fetch administrator with ID ${id}` };
    }
  }, [authApi]);

  const updateAdministrator = useCallback(async (id: number, payload: UpdateUserRequest): Promise<ApiResponse<User>> => {
    try {
      const response = await authApi.put(`${BASE_PATH}/administrator/${id}`, payload);
      return { data: response.data.data as User, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to update administrator with ID ${id}` };
    }
  }, [authApi]);

  const deleteAdministrator = useCallback(async (id: number): Promise<ApiResponse<boolean>> => {
    try {
      await authApi.delete(`${BASE_PATH}/administrator/${id}`);
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : `Failed to delete administrator with ID ${id}` };
    }
  }, [authApi]);

  return useMemo(() => ({
    getMe,
    changeOwnPassword,
    getById,
    search,
    getStatistics,
    activate,
    deactivate,
    assignRole,
    removeRole,
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    createAdministrator,
    getAllAdministrators,
    getAdministratorById,
    updateAdministrator,
    deleteAdministrator,
  }), [
    getMe,
    changeOwnPassword,
    getById,
    search,
    getStatistics,
    activate,
    deactivate,
    assignRole,
    removeRole,
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    createAdministrator,
    getAllAdministrators,
    getAdministratorById,
    updateAdministrator,
    deleteAdministrator,
  ]);
};