import { auth, requiredScopes } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';

export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256',
});

export const debugToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('AUTH HEADER:', req.headers.authorization);
  console.log('ENV VARS:', {
    audience: process.env.AUTH0_AUDIENCE,
    issuer: process.env.AUTH0_ISSUER_BASE_URL
  });
  next();
};

export const requireScope = (scopes: string[]) => requiredScopes(scopes);