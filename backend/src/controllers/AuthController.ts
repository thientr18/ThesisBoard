import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AppError } from '../utils/AppError';
import { AuthResult } from 'express-oauth2-jwt-bearer';

// Extend the JWT verification result type to include Auth0 properties
interface Auth0JwtPayload extends AuthResult {
  sub: string;          // Auth0 user ID
  email?: string;       
  name?: string;
  [key: string]: any;   // For any other custom claims
}

const authService = new AuthService();

/**
 * Get current user's profile
 */
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Cast to unknown first, then to our expected type
    const auth0Payload = req.auth as unknown as Auth0JwtPayload;
    const auth0Id = auth0Payload?.sub;
    
    if (!auth0Id) {
      return next(new AppError('Authentication required', 401));
    }
    
    // Get user from database by Auth0 ID
    let user = await authService.getUserByAuth0Id(auth0Id);
    
    // If user doesn't exist in database, create based on Auth0 profile
    if (!user) {
      user = await authService.syncUserProfile(auth0Id, auth0Payload);
    }
    
    // Remove sensitive information
    const userProfile = {
      id: user.id,
      auth0Id: user.auth0UserId,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      status: user.status,
      createdAt: user.createdAt,
    };
    
    return res.status(200).json({
      status: 'success',
      data: { user: userProfile }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update current user's profile
 */
export const updateCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Cast to unknown first, then to our expected type
    const auth0Payload = req.auth as unknown as Auth0JwtPayload;
    const auth0Id = auth0Payload?.sub;
    
    if (!auth0Id) {
      return next(new AppError('Authentication required', 401));
    }
    
    // Get user from database
    const user = await authService.getUserByAuth0Id(auth0Id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Update user profile
    const updatedUser = await authService.updateUserProfile(user.id, req.body);
    
    const userProfile = {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      status: updatedUser.status,
      updatedAt: updatedUser.updatedAt
    };
    
    return res.status(200).json({
      status: 'success',
      data: { user: userProfile }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Login callback handler to synchronize user data
 */
export const handleLoginCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Cast to unknown first, then to our expected type
    const auth0Payload = req.auth as unknown as Auth0JwtPayload;
    const auth0Id = auth0Payload?.sub;
    
    if (!auth0Id) {
      return next(new AppError('Authentication required', 401));
    }
    
    // Synchronize user profile from Auth0 to database
    await authService.syncUserProfile(auth0Id, auth0Payload);
    
    return res.status(200).json({
      status: 'success',
      message: 'User profile synchronized'
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Verify token and return user info
 * Used by frontend to check if token is valid
 */
export const verifyToken = (req: Request, res: Response) => {
  return res.status(200).json({
    status: 'success',
    data: {
      user: req.auth
    }
  });
};