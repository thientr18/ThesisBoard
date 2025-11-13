export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface User {
  id: number;
  auth0Id: string;
  username: string;
  email: string;
  fullName: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface UserWithRoles {
  id: number;
  auth0Id: string;
  username: string;
  email: string;
  fullName: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  roleDistribution: {
    roleName: string;
    count: number;
  }[];
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  roles?: string[];
  isActive?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
  picture?: string;
}

export interface AssignRoleRequest {
  userId: number;
  roleName: string;
}

export interface SearchUsersParams {
  query?: string;
  role?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}

export interface StudentDetails {
  id: number;
  userId: number;
  studentId: string;
  cohortYear: number | null;
  className: string | null;
  phone: string | null;
  dob: Date | null;
  gender: 'male' | 'female' | 'other' | null;
  status: 'active' | 'inactive' | 'graduated';
}

export interface TeacherDetails {
  id: number;
  userId: number;
  teacherCode: string | null;
  title: string | null;
  office: string | null;
  phone: string | null;
  email: string | null;
}