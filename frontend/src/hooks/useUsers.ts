import { useState, useEffect, useCallback } from 'react';
import type { User, SearchUsersParams } from '../types/user.types';
import { useUserApi } from '../api/endpoints/user.api';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  searchUsers: (params: SearchUsersParams) => Promise<void>;
  deleteUser: (id: number) => Promise<boolean>;
  toggleUserStatus: (id: number, activate: boolean) => Promise<boolean>;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const userApi = useUserApi();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await userApi.getAll();
    setLoading(false);
    
    if (result.error) {
      setError(result.error);
      return;
    }
    
    if (result.data) {
      setUsers(result.data);
    }
  }, [userApi]);

  const searchUsers = useCallback(async (params: SearchUsersParams) => {
    setLoading(true);
    setError(null);
    
    const result = await userApi.search(params);
    setLoading(false);
    
    if (result.error) {
      setError(result.error);
      return;
    }
    
    if (result.data) {
      setUsers(result.data);
    }
  }, [userApi]);

  const deleteUser = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    const result = await userApi.delete(id);
    setLoading(false);
    
    if (result.error) {
      setError(result.error);
      return false;
    }
    
    await fetchUsers();
    return true;
  }, [userApi, fetchUsers]);

  const toggleUserStatus = useCallback(async (id: number, activate: boolean): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    const result = activate 
      ? await userApi.activate(id)
      : await userApi.deactivate(id);
    
    setLoading(false);
    
    if (result.error) {
      setError(result.error);
      return false;
    }
    
    await fetchUsers();
    return true;
  }, [userApi, fetchUsers]);

  // Load users on initial mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    searchUsers,
    deleteUser,
    toggleUserStatus
  };
};