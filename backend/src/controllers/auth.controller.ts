import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { AuthResult } from 'express-oauth2-jwt-bearer';

interface Auth0JwtPayload extends AuthResult {
  sub: string;          // Auth0 user ID
  email?: string;       
  name?: string;
  [key: string]: any;   // For any other custom claims
}

export class AuthController {
  /**
   * Verify token and return user info
   * Used by frontend to check if token is valid
   */
  verifyToken = (req: Request, res: Response) => {
    return res.status(200).json({
      status: 'success',
      data: {
        user: req.auth
      }
    });
  }
}