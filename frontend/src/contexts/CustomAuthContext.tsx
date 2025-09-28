import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, logout, getToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      setAuthenticated(isAuthenticated());
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    navigate('/login');
  };

  const value = {
    isAuthenticated: authenticated,
    loading,
    logout: handleLogout,
    getToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useCustomAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useCustomAuth must be used within an AuthProvider');
  }
  return context;
};