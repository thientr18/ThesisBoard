import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

// Extend the Express Request type to include the user property
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

/**
 * Middleware to check if user has required roles or permissions
 * @param allowedRolesOrPermissions - Array of roles/permissions that can access the route
 * @returns Express middleware function
 */
export const roleMiddleware = (allowedRolesOrPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.user) {
      return next(
        new AppError('You are not logged in. Please log in to access this resource', 401, 'UNAUTHORIZED')
      );
    }

    // Extract user roles and permissions
    const { roles = [], permissions = [] } = req.user;
    
    // Check if the user has admin:all role which grants all permissions
    if (roles.includes('admin:all')) {
      return next();
    }

    // Check if the user has any of the required roles or permissions
    const hasRequiredAccess = allowedRolesOrPermissions.some(
      (roleOrPermission) => 
        roles.includes(roleOrPermission) || permissions.includes(roleOrPermission)
    );

    if (!hasRequiredAccess) {
      return next(
        new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN')
      );
    }

    // User has the necessary permission, proceed to the next middleware/controller
    next();
  };
};

/**
 * Middleware to check if user has ALL of the specified roles or permissions
 * Useful for operations that require multiple permissions
 * @param requiredRolesOrPermissions - Array of roles/permissions that ALL must be present
 * @returns Express middleware function
 */
export const requireAllPermissions = (requiredRolesOrPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.user) {
      return next(
        new AppError('You are not logged in. Please log in to access this resource', 401, 'UNAUTHORIZED')
      );
    }

    // Extract user roles and permissions
    const { roles = [], permissions = [] } = req.user;
    
    // Admin always has access
    if (roles.includes('admin:all')) {
      return next();
    }

    // Check if the user has ALL of the required roles or permissions
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