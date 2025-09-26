import { type PropsWithChildren, useEffect } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { configureAuth } from '../api/axios0Instance';

function AuthAxiosBridge() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  
  useEffect(() => {
    configureAuth(async () => {
      if (!isAuthenticated) {
        console.log('User not authenticated');
        return null;
      }
      try {
        console.log('Getting token for audience:', import.meta.env.VITE_AUTH0_AUDIENCE);
        const token = await getAccessTokenSilently({
          authorizationParams: { 
            audience: import.meta.env.VITE_AUTH0_AUDIENCE 
          },
        });
        console.log('Token received:', token ? 'YES (length: ' + token.length + ')' : 'NO');
        return token;
      } catch (error) {
        console.error('Error getting token:', error);
        return null;
      }
    });
  }, [getAccessTokenSilently, isAuthenticated]);
  
  return null;
}

export function AuthProvider({ children }: PropsWithChildren) {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
    >
      <AuthAxiosBridge />
      {children}
    </Auth0Provider>
  );
}