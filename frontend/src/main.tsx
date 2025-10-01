import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Auth0Provider } from '@auth0/auth0-react'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin + '/callback',
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'openid profile email'
        }}
        useRefreshTokens={true}
        cacheLocation="localstorage"
      >
        <App />
      </Auth0Provider>
    </BrowserRouter>
  </StrictMode>,
)