import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AppError } from '../utils/AppError';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
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
    try {
      const { id } = req.params;
      const user = await this.userService.getUserWithRoles(parseInt(id));
      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  // Assign role to user
  assignRoleToUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, roleId } = req.body;
      if (!userId || !roleId) {
        return next(new AppError('User ID and Role ID are required', 400, 'MISSING_FIELDS'));
      }
      
      const result = await this.userService.assignRoleToUser(parseInt(userId), parseInt(roleId));
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Remove role from user
  removeRoleFromUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, roleId } = req.body;
      if (!userId || !roleId) {
        return next(new AppError('User ID and Role ID are required', 400, 'MISSING_FIELDS'));
      }
      
      const result = await this.userService.removeRoleFromUser(parseInt(userId), parseInt(roleId));
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Get users by role
  getUsersByRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roleName } = req.params;
      const users = await this.userService.getUsersByRole(roleName);
      res.status(200).json({
        status: 'success',
        results: users.length,
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
}

// Don't forget to add this import at the top
import { Op } from 'sequelize';

export default UserController;