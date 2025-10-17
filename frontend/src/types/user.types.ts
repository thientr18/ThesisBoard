export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  auth0Id: string;
  isActive: boolean;
  picture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithRoles extends User {
  roles: Role[];
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