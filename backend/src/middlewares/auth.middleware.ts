import { auth, AuthResult, requiredScopes } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';

// Auth0 JWT verification result with properties
interface ExtendedJwtPayload extends AuthResult {
  permissions?: string[];
  roles?: string[];
  [key: string]: any; // Allow for dynamic properties like namespace claims
}

export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256',
});

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.auth as ExtendedJwtPayload;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    const roles = user.permissions || 
                  (process.env.AUTH0_AUDIENCE ? user[`${process.env.AUTH0_AUDIENCE}/roles`] : undefined) || 
                  user.roles || 
                  user['https://thesisboard-api.com/roles'];
    
    // For debugging
    console.log('User auth object:', user);
    console.log('Roles found:', roles);
    
    if (!roles || !Array.isArray(roles) || !roles.includes('admin')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error in requireAdmin middleware:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while checking admin permissions'
    });
  }
};

export const debugToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('AUTH HEADER:', req.headers.authorization);
  console.log('ENV VARS:', {
    audience: process.env.AUTH0_AUDIENCE,
    issuer: process.env.AUTH0_ISSUER_BASE_URL
  });
  next();
};

export const requireScope = (scopes: string[]) => requiredScopes(scopes);