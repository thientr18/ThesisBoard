import { Request, Response, NextFunction } from 'express';
import { AuthResult } from 'express-oauth2-jwt-bearer';
import { AppError } from '../utils/AppError';

interface RequestWithAuth extends Request {
  auth?: AuthResult & {
    payload?: {
      permissions?: string[];
      [key: string]: any;
    };
  };
}

export const allowedPermissions = (permissions: string[]) => {
  return (req: RequestWithAuth, res: Response, next: NextFunction) => {
    if (!req.auth || !req.auth.payload) {
      return next(
        new AppError('You are not logged in. Please log in to access this resource', 401, 'UNAUTHORIZED')
      );
    }

    const { permissions = [] } = req.auth.payload;
    
    if (permissions.includes('admin:all')) {
      return next();
    }

    const hasRequiredAccess = permissions.some(
      (permission) => 
        permissions.includes(permission)
    );

    if (!hasRequiredAccess) {
      return next(
        new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN')
      );
    }

    // Valid permission -> proceed to the next middleware/controller
    next();
  };
};

export const requireAllPermissions = (permissions: string[]) => {
  return (req: RequestWithAuth, res: Response, next: NextFunction) => {
    if (!req.auth || !req.auth.payload) {
      return next(
        new AppError('You are not logged in. Please log in to access this resource', 401, 'UNAUTHORIZED')
      );
    }

    const { permissions = [] } = req.auth.payload;
    
    if (permissions.includes('admin:all')) {
      return next();
    }

    const hasAllRequiredAccess = permissions.every(
      (permission) => 
        permissions.includes(permission)
    );

    if (!hasAllRequiredAccess) {
      return next(
        new AppError('You do not have all required permissions for this operation', 403, 'FORBIDDEN')
      );
    }

    // User has all necessary permissions, proceed
    next();
  };
};