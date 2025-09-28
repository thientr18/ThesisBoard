export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  const expiresAt = localStorage.getItem('expires_at');
  
  if (!token || !expiresAt) {
    return false;
  }
  
  return parseInt(expiresAt) > Date.now();
};

export const logout = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('expires_at');
};

export const getToken = (): string | null => {
  return isAuthenticated() ? localStorage.getItem('auth_token') : null;
};