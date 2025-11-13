import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { UserService } from '../services/user.service';
import { Auth0Service } from '../services/auth0.service';
import { AppError } from '../utils/AppError';
import type { UserProfile } from '../types/profile.types';
import type { StudentDetails } from '../types/user.types';
import dotenv from "dotenv";

dotenv.config();


export class UserController {
  private userService: UserService;
  private auth0Service: Auth0Service;

  constructor() {
    this.userService = new UserService();
    this.auth0Service = new Auth0Service();
  }

  // Get all users with pagination
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Extract filters from query params
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.username) filters.username = { [Op.like]: `%${req.query.username}%` };
      if (req.query.email) filters.email = { [Op.like]: `%${req.query.email}%` };
      
      const users = await this.userService.getUsers(page, limit, filters);
      res.status(200).json({
        status: 'success',
        results: users.count,
        data: users.rows,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(users.count / limit),
          totalResults: users.count
        }
      });
    } catch (error) {
      next(error);
    }
  };

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
  }

  /**
   * Update current user's profile
   */
  updateCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {

    } catch (error) {
      return next(error);
    }
  }
  

  // Get user by ID
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(parseInt(id));
      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  // Create a new user
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;
      const newUser = await this.userService.createUser(userData);
      res.status(201).json({
        status: 'success',
        data: newUser
      });
    } catch (error) {
      next(error);
    }
  };

  // Update a user
  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      const updatedUser = await this.userService.updateUser(parseInt(id), userData);
      res.status(200).json({
        status: 'success',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete a user
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(parseInt(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // Activate a user
  activateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.activateUser(parseInt(id));
      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  // Deactivate a user
  deactivateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.deactivateUser(parseInt(id));
      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  // Search for users
  searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req.query;
      if (!query) {
        return next(new AppError('Search query is required', 400, 'MISSING_QUERY'));
      }
      
      const users = await this.userService.searchUsers(query as string);
      res.status(200).json({
        status: 'success',
        results: users.length,
        data: users
      });
    } catch (error) {
      next(error);
    }
  };

  // Get user with roles
  getUserWithRoles = async (req: Request, res: Response, next: NextFunction) => {
    // call to auth0
    // then call getUsers with the user IDs obtained from auth0
  };

  // Assign role to user
  assignRoleToUser = async (req: Request, res: Response, next: NextFunction) => {
    // call to auth0
  };

  // Remove role from user
  removeRoleFromUser = async (req: Request, res: Response, next: NextFunction) => {
    // call to auth0
  };

  // Get users by role
  getUsersByRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIds = req.body.userIds;
      const users = await this.userService.getUsers(userIds);
      res.status(200).json({
        status: 'success',
        results: users,
        data: users
      });
    } catch (error) {
      next(error);
    }
  };

  // Get user statistics
  getUserStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const statistics = await this.userService.getUserStatistics();
      res.status(200).json({
        status: 'success',
        data: statistics
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