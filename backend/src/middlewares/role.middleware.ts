import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        roles: string[];
        permissions: string[];
      };
    }
  }
}

export const roleMiddleware = (allowedRolesOrPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError('You are not logged in. Please log in to access this resource', 401, 'UNAUTHORIZED')
      );
    }

    const { roles = [], permissions = [] } = req.user;
    
    if (roles.includes('admin:all')) {
      return next();
    }

    const hasRequiredAccess = allowedRolesOrPermissions.some(
      (roleOrPermission) => 
        roles.includes(roleOrPermission) || permissions.includes(roleOrPermission)
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

export const requireAllPermissions = (requiredRolesOrPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError('You are not logged in. Please log in to access this resource', 401, 'UNAUTHORIZED')
      );
    }

    const { roles = [], permissions = [] } = req.user;
    
    if (roles.includes('admin:all')) {
      return next();
    }

    const hasAllRequiredAccess = requiredRolesOrPermissions.every(
      (roleOrPermission) => 
        roles.includes(roleOrPermission) || permissions.includes(roleOrPermission)
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