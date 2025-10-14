import { Request, Response, NextFunction } from 'express';
import { AuthService, UserWithRoles } from '../services/auth.service';
import { AppError } from '../utils/AppError';
import { AuthResult } from 'express-oauth2-jwt-bearer';

interface Auth0JwtPayload extends AuthResult {
  sub: string;          // Auth0 user ID
  email?: string;       
  name?: string;
  [key: string]: any;   // For any other custom claims
}

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Get current user's profile
   */
  getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Cast to unknown first, then to our expected type
      const auth0Payload = req.auth as unknown as Auth0JwtPayload;
      const auth0Id = auth0Payload?.sub;
      
      if (!auth0Id) {
        return next(new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED'));
      }
      
      // Get user from database by Auth0 ID
      let user = await this.authService.getUserByAuth0Id(auth0Id) as UserWithRoles;
      
      // If user doesn't exist in database, create based on Auth0 profile
      if (!user) {
        user = await this.authService.syncUserProfile(auth0Id, auth0Payload);
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
        roles: user.roles
      };
      
      return res.status(200).json({
        status: 'success',
        data: { user: userProfile }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update current user's profile
   */
  updateCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Cast to unknown first, then to our expected type
      const auth0Payload = req.auth as unknown as Auth0JwtPayload;
      const auth0Id = auth0Payload?.sub;
      
      if (!auth0Id) {
        return next(new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED'));
      }
      
      // Get user from database
      const user = await this.authService.getUserByAuth0Id(auth0Id);
      
      if (!user) {
        return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
      }
      
      // Update user profile
      const updatedUser = await this.authService.updateUserProfile(user.id, req.body);
      
      const userProfile = {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        status: updatedUser.status,
        updatedAt: updatedUser.updatedAt,
        roles: updatedUser.roles
      };
      
      return res.status(200).json({
        status: 'success',
        data: { user: userProfile }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Login callback handler to synchronize user data
   */
  handleLoginCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Cast to unknown first, then to our expected type
      const auth0Payload = req.auth as unknown as Auth0JwtPayload;
      const auth0Id = auth0Payload?.sub;
      
      if (!auth0Id) {
        return next(new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED'));
      }
      
      // Synchronize user profile from Auth0 to database
      await this.authService.syncUserProfile(auth0Id, auth0Payload);
      
      return res.status(200).json({
        status: 'success',
        message: 'User profile synchronized'
      });
    } catch (error) {
      return next(error);
    }
  }

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