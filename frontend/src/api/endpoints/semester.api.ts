import { useAuthenticatedApi } from '../config';
import { useCallback, useMemo } from 'react';
import type {
  ApiResponse,
  Semester,
  CreateSemesterRequest,
  UpdateSemesterRequest,
} from '../../types/semester.types';

const BASE_PATH = '/api/semesters';

export const useSemesterApi = () => {
  const authApi = useAuthenticatedApi();

  // GET /api/semesters
  const getAll = useCallback(async (): Promise<ApiResponse<Semester[]>> => {
    try {
      const res = await authApi.get(BASE_PATH);
      return { data: res.data as Semester[], error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch semesters' };
    }
  }, [authApi]);

  // GET /api/semesters/:id
  const getById = useCallback(async (id: number): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/${id}`);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch semester' };
    }
  }, [authApi]);

  // POST /api/semesters
  const create = useCallback(async (payload: CreateSemesterRequest | FormData): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.post(BASE_PATH, payload);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to create semester' };
    }
  }, [authApi]);

  // PUT /api/semesters/:id
  const update = useCallback(async (id: number, payload: UpdateSemesterRequest): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.put(`${BASE_PATH}/${id}`, payload);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to update semester' };
    }
  }, [authApi]);

  // DELETE /api/semesters/:id
  const deleteOne = useCallback(async (id: number): Promise<ApiResponse<boolean>> => {
    try {
      await authApi.delete(`${BASE_PATH}/${id}`);
      return { data: true, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to delete semester' };
    }
  }, [authApi]);

  // GET /api/semesters/current
  const getCurrent = useCallback(async (): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/current`);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch current semester' };
    }
  }, [authApi]);

  // POST /api/semesters/current/:id
  const setCurrent = useCallback(async (id: number): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.post(`${BASE_PATH}/current/${id}`);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to set current semester' };
    }
  }, [authApi]);

  // PATCH /api/semesters/unset-current/:id
  const unsetCurrent = useCallback(async (id: number): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.patch(`${BASE_PATH}/unset-current/${id}`);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to unset current semester' };
    }
  }, [authApi]);

  // GET /api/semesters/active
  const getActive = useCallback(async (): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.get(`${BASE_PATH}/active`);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch active semester' };
    }
  }, [authApi]);

  // POST /api/semesters/active/:id
  const setActive = useCallback(async (id: number): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.post(`${BASE_PATH}/active/${id}`);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to set active semester' };
    }
  }, [authApi]);

  // PATCH /api/semesters/unset-active/:id
  const unsetActive = useCallback(async (id: number): Promise<ApiResponse<Semester>> => {
    try {
      const res = await authApi.patch(`${BASE_PATH}/unset-active/${id}`);
      return { data: res.data as Semester, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to unset active semester' };
    }
  }, [authApi]);

  // get Student Semesters data
  // GET /api/semesters/student-semesters/semester/:semesterId
  const getStudentsInSemester = useCallback(
    async (
      semesterId: number,
      page = 1,
      pageSize = 15,
      search?: string,
      studentCode?: string,
      status?: string,
      type?: string // thêm type ở đây
    ): Promise<ApiResponse<any>> => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        if (search) params.append("search", search);
        if (studentCode) params.append("studentCode", studentCode);
        if (status && status !== "all") params.append("status", status);
        if (type && type !== "all") params.append("type", type); // truyền type

        const res = await authApi.get(
          `${BASE_PATH}/student-semesters/semester/${semesterId}?${params.toString()}`
        );
        return { data: res.data, error: null };
      } catch (e) {
        return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch students in semester' };
      }
    },
    [authApi]
  );
  
  // GET /api/semesters/student-semesters/:studentId
  const getSemesterForStudent = useCallback(async (studentId: number) => {
    try {
      const res = await authApi.get(`${BASE_PATH}/student-semesters/student/${studentId}`);
      return { data: res.data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch semesters for student' };
    }
  }, [authApi]);

  // GET /api/semesters/student-semesters/:studentId/:semesterId
  const getStudentSemester = useCallback(async (studentId: number, semesterId: number) => {
    try {
      const res = await authApi.get(`${BASE_PATH}/student-semesters/${studentId}/${semesterId}`);
      return { data: res.data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to add semester for student' };
    }
  }, [authApi]);

  // POST /api/semesters/student-semesters/:semesterId
  const createStudentInSemester = useCallback(async (semesterId: number, payload: any) => {
    try {
      const res = await authApi.post(`${BASE_PATH}/student-semesters/${semesterId}`, payload);
      return { data: res.data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to create student in semester' };
    }
  }, [authApi]);

  // PUT /api/semesters/student-semesters/:studentId/:semesterId
  const updateStudentInSemester = useCallback(async (studentId: number, semesterId: number, payload: any) => {
    try {
      const res = await authApi.put(`${BASE_PATH}/student-semesters/${studentId}/${semesterId}`, payload);
      return { data: res.data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to update student in semester' };
    }
  }, [authApi]);

  // DELETE /api/semesters/student-semesters/:studentId/:semesterId
  const deleteStudentFromSemester = useCallback(async (studentId: number, semesterId: number) => {
    try {
      const res = await authApi.delete(`${BASE_PATH}/student-semesters/${studentId}/${semesterId}`);
      return { data: res.data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to delete student from semester' };
    }
  }, [authApi]);

  // Teacher
  // GET /api/semesters/teacher/:semesterId
  const getTeachersInSemester = useCallback(async (semesterId: number) => {
    try {
      const res = await authApi.get(`${BASE_PATH}/teacher/${semesterId}`);
      return { data: res.data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch teachers in semester' };
    }
  }, [authApi]);

  // POST /api/semesters/teacher/:semesterId
  const createTeacherInSemester = useCallback(async (semesterId: number, payload: any) => {
    try {
      const res = await authApi.post(`${BASE_PATH}/teacher/${semesterId}`, payload);
      return { data: res.data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to create teacher in semester' };
    }
  }, [authApi]);

  // PUT /api/semesters/teacher/:semesterId/:teacherId
  const updateTeacherInSemester = useCallback(async (semesterId: number, teacherId: number, payload: any) => {
    try {
      const res = await authApi.put(`${BASE_PATH}/teacher/${semesterId}/${teacherId}`, payload);
      return { data: res.data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to update teacher in semester' };
    }
  }, [authApi]);

  // DELETE /api/semesters/teacher/:semesterId/:teacherId
  const deleteTeacherFromSemester = useCallback(async (semesterId: number, teacherId: number) => {
    try {
      const res = await authApi.delete(`${BASE_PATH}/teacher/${semesterId}/${teacherId}`);
      return { data: res.data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Failed to delete teacher from semester' };
    }
  }, [authApi]);

  return useMemo(() => ({
    getAll,
    getById,
    create,
    update,
    delete: deleteOne,
    getCurrent,
    setCurrent,
    unsetCurrent,
    getActive,
    setActive,
    unsetActive,
    getStudentsInSemester,
    getSemesterForStudent,
    getStudentSemester,
    createStudentInSemester,
    updateStudentInSemester,
    deleteStudentFromSemester,
    getTeachersInSemester,
    createTeacherInSemester,
    updateTeacherInSemester,
    deleteTeacherFromSemester,
  }), [
    getAll,
    getById,
    create,
    update,
    deleteOne,
    getCurrent,
    setCurrent,
    unsetCurrent,
    getActive,
    setActive,
    unsetActive,
    getStudentsInSemester,
    getSemesterForStudent,
    getStudentSemester,
    createStudentInSemester,
    updateStudentInSemester,
    deleteStudentFromSemester,
    getTeachersInSemester,
    createTeacherInSemester,
    updateTeacherInSemester,
    deleteTeacherFromSemester,
  ]);
};