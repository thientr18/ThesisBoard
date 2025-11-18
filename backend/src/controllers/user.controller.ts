import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { UserService } from '../services/user.service';
import { Auth0Service } from '../services/auth0.service';
import { AppError } from '../utils/AppError';
import type { UserProfile } from '../types/profile.types';
import type { StudentDetails } from '../types/user.types';
import dotenv from "dotenv";
import User from '../models/User';

dotenv.config();


export class UserController {
  private userService: UserService;
  private auth0Service: Auth0Service;

  constructor() {
    this.userService = new UserService();
    this.auth0Service = new Auth0Service();
  }
  
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.createUser(req.body);
      res.status(201).json({ status: 'success', data: result });
    } catch (err) { next(err); }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const result = await this.userService.updateUser(id, req.body);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) { next(err); }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await this.userService.deleteUser(id, req.user?.id ? parseInt(req.user.id) : undefined);
      res.status(204).send();
    } catch (err) { next(err); }
  }

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, role, status, search } = req.query;
      const result = await this.userService.listUsers({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        role: role as string,
        status: status as string,
        search: search as string,
      });
      res.status(200).json({ status: 'success', ...result });
    } catch (err) { next(err); }
  }

  /**
   * Get current user's profile
   */
  getCurrentUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const user = await this.userService.getUserById(userId);

      const auth0Roles = await this.auth0Service.getUserRoles(user.auth0UserId as string);

      const me = {
        id: user.id,
        auth0Id: user.auth0UserId,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        roles: auth0Roles,
      } as UserProfile;
      
      res.status(200).json({ status: 'success', user: me });
    } catch (error) {
      return next(error);
    }
  };

  // Get user by ID
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError('Invalid user ID', 400, 'INVALID_ID');
      const user = await this.userService.getUserById(id);
      res.status(200).json({ status: 'success', user });
    } catch (error) {
      next(error);
    }
  };

  // Activate a user
  activateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await this.userService.activateUser(id);
      res.status(200).json({ status: 'success', message: 'User activated' });
    } catch (error) {
      next(error);
    }
  };

  // Deactivate a user
  deactivateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await this.userService.deactivateUser(id);
      res.status(200).json({ status: 'success', message: 'User deactivated' });
    } catch (error) {
      next(error);
    }
  };

  // Assign role to user
  assignRoleToUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.body.userId || req.params.id);
      const { roleIds } = req.body;
      if (!Array.isArray(roleIds) || !roleIds.length) {
        throw new AppError('roleIds must be a non-empty array', 400, 'INVALID_ROLE_IDS');
      }
      const user = await this.userService.getUserById(id);
      await this.auth0Service.assignRolesToUser(user.auth0UserId as string, roleIds);
      res.status(200).json({ status: 'success', message: 'Roles assigned' });
    } catch (error) {
      next(error);
    }
  };

  // Assign permissions to user (not directly supported by Auth0, usually via roles)
  assignPermissionsToUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Permissions are typically assigned via roles in Auth0
      throw new AppError('Direct permission assignment not supported. Use roles.', 400, 'NOT_SUPPORTED');
    } catch (error) {
      next(error);
    }
  };

  // Remove role from user
  removeRoleFromUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.body.userId || req.params.id);
      const { roleIds } = req.body;
      if (!Array.isArray(roleIds) || !roleIds.length) {
        throw new AppError('roleIds must be a non-empty array', 400, 'INVALID_ROLE_IDS');
      }
      const user = await this.userService.getUserById(id);
      // Auth0 API for removing roles: DELETE /users/{id}/roles with body { roles: [...] }
      await this.auth0Service.removeRolesFromUser(user.auth0UserId as string, roleIds);      res.status(200).json({ status: 'success', message: 'Roles removed' });
    } catch (error) {
      next(error);
    }
  };

  // Remove permissions from user (not directly supported by Auth0, usually via roles)
  removePermissionsFromUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      throw new AppError('Direct permission removal not supported. Use roles.', 400, 'NOT_SUPPORTED');
    } catch (error) {
      next(error);
    }
  };

  // Get users by role
  getUsersByRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roleName } = req.params;
      let users;
      if (roleName === 'teacher') {
        users = await this.userService.listUsers({ role: 'teacher', limit: 100 });
      } else if (roleName === 'student') {
        users = await this.userService.listUsers({ role: 'student', limit: 100 });
      } else if (roleName === 'admin' || roleName === 'moderator') {
        // For admin/moderator, filter by Auth0 roles
        const auth0Users = await this.auth0Service.getUsers(`app_metadata.roles:"${roleName}"`, 0, 100);
        const ids = auth0Users.users.map(u => u.user_id);
        // Use service/repository to fetch users by auth0UserId
        users = await this.userService.getUsersByAuth0Ids(ids);
      } else {
        throw new AppError('Invalid role', 400, 'INVALID_ROLE');
      }
      res.status(200).json({ status: 'success', users });
    } catch (error) {
      next(error);
    }
  };

  // Get user statistics
  getUserStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.userService.getUserStatistics();
      res.status(200).json({ status: 'success', statistics: stats });
    } catch (error) {
      next(error);
    }
  };

  // Search for users
  searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string' || q.length < 2) {
        throw new AppError('Search query too short', 400, 'INVALID_SEARCH');
      }
      const users = await this.userService.searchUsers(q);
      res.status(200).json({ status: 'success', users });
    } catch (error) {
      next(error);
    }
  };

  // Get user with roles
  getUserWithRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError('Invalid user ID', 400, 'INVALID_ID');
      const user = await this.userService.getUserById(id);
      if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      const roles = await this.auth0Service.getUserRoles(user.auth0UserId as string);
      res.status(200).json({
        status: 'success',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          status: user.status,
          roles,
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Student-specific operations
  getStudentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const student = await this.userService.getStudentById(parseInt(id));
      res.status(200).json({
        status: 'success',
        student
      });
    }
    catch (error) {
      next(error);
    }
  };

  // Teacher-specific operations
  getTeacherById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const teacher = await this.userService.getTeacherById(parseInt(id));
      res.status(200).json({
        status: 'success',
        teacher
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;