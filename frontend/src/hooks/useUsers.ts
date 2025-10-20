import { useCallback, useEffect, useState } from 'react';
import type { User, CreateUserRequest } from '../types/user.types';
import { useUserApi } from '../api/endpoints/user.api';

interface UseUsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

interface UseUsersActions {
  fetchUsers: () => Promise<void>;
  searchUsers: (keyword: string) => Promise<void>;
  addUser: (payload: CreateUserRequest) => Promise<User | null>;
  deleteUser: (id: number) => Promise<void>;
}

export const useUsers = (): {
  state: UseUsersState;
  actions: UseUsersActions;
} => {
  const userApi = useUserApi();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await userApi.getAll();
      if (error) {
        setError(error);
        setUsers([]);
      } else if (data) {
        setUsers(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [userApi]);

  const searchUsers = useCallback(async (keyword: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await userApi.search({ query: keyword });
      if (error) {
        setError(error);
        setUsers([]);
      } else if (data) {
        setUsers(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [userApi]);

  const addUser = useCallback(
    async (payload: CreateUserRequest): Promise<User | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await userApi.create(payload);
        if (error || !data) {
          setError(error || 'Failed to add user');
          return null;
        }
        setUsers(prev => [data, ...prev]);
        return data;
      } catch (err: any) {
        setError(err.message || 'Failed to add user');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userApi]
  );

  const deleteUser = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await userApi.delete(id);
      if (error || !data) {
        setError(error || 'Failed to delete user');
      } else {
        setUsers(prev => prev.filter(user => user.id !== id));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  }, [userApi]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    state: { users, loading, error },
    actions: { fetchUsers, searchUsers, addUser, deleteUser },
  };
};

// Example usage in a component:

/*
import React, { useState } from 'react';
import { useUsers } from '../hooks/useUsers';

const UserList: React.FC = () => {
  const { state, actions } = useUsers();
  const { users, loading, error } = state;
  const [search, setSearch] = useState('');

  const handleSearch = () => {
    actions.searchUsers(search);
  };

  return (
    <div>
      <h2>User List</h2>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search users"
      />
      <button onClick={handleSearch}>Search</button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.displayName} ({user.email})
            <button onClick={() => actions.deleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={actions.fetchUsers}>Refresh</button>
    </div>
  );
};

export default UserList;
*/