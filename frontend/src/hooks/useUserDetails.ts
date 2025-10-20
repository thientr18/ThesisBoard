import { useCallback, useEffect, useState } from 'react';
import type { User, UpdateUserRequest, ApiResponse } from '../types/user.types';
import { useUserApi } from '../api/endpoints/user.api';

interface UseUserDetailState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface UseUserDetailActions {
  refetch: () => Promise<void>;
  updateUser: (payload: UpdateUserRequest) => Promise<ApiResponse<User>>;
  deactivateUser: () => Promise<ApiResponse<User>>;
}

interface UseUserDetailReturn {
  state: UseUserDetailState;
  actions: UseUserDetailActions;
}

export const useUserDetail = (userId: number | null): UseUserDetailReturn => {
  const userApi = useUserApi();

  const [state, setState] = useState<UseUserDetailState>({
    user: null,
    loading: false,
    error: null,
  });

  const fetchUser = useCallback(async () => {
    if (userId == null) {
      setState({ user: null, loading: false, error: null });
      return;
    }
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await userApi.getById(userId);
      setState({ user: res.data, loading: false, error: res.error });
    } catch (err: any) {
      setState({ user: null, loading: false, error: err.message || 'Failed to fetch user' });
    }
  }, [userApi, userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateUser = useCallback(
    async (payload: UpdateUserRequest) => {
      if (userId == null) return { data: null, error: 'No user ID provided' };
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const res = await userApi.update(userId, payload);
        if (!res.error) {
          setState({ user: res.data, loading: false, error: null });
        } else {
          setState(prev => ({ ...prev, loading: false, error: res.error }));
        }
        return res;
      } catch (err: any) {
        setState(prev => ({ ...prev, loading: false, error: err.message || 'Failed to update user' }));
        return { data: null, error: err.message || 'Failed to update user' };
      }
    },
    [userApi, userId]
  );

  const deactivateUser = useCallback(
    async () => {
      if (userId == null) return { data: null, error: 'No user ID provided' };
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const res = await userApi.deactivate(userId);
        if (!res.error) {
          setState({ user: res.data, loading: false, error: null });
        } else {
          setState(prev => ({ ...prev, loading: false, error: res.error }));
        }
        return res;
      } catch (err: any) {
        setState(prev => ({ ...prev, loading: false, error: err.message || 'Failed to deactivate user' }));
        return { data: null, error: err.message || 'Failed to deactivate user' };
      }
    },
    [userApi, userId]
  );

  return {
    state,
    actions: {
      refetch: fetchUser,
      updateUser,
      deactivateUser,
    },
  };
};