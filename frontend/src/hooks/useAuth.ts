import { useAuth0 } from '@auth0/auth0-react';

export function useAuth() {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently
  } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      appState: { returnTo: window.location.pathname }
    });
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login: handleLogin,
    logout: handleLogout,
    getToken: getAccessTokenSilently
  };
}