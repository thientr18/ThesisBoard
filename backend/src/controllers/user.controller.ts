import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { Auth0Service } from '../services/auth0.service';
import { AppError } from '../utils/AppError';
import type { UserProfile } from '../types/profile.types';
import dotenv from "dotenv";

dotenv.config();

export class UserController {
  private userService: UserService;
  private auth0Service: Auth0Service;

  constructor() {
    this.userService = new UserService();
    this.auth0Service = new Auth0Service();
  }
  
  // Student CRUD
  createStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.createStudent(req.body);
      res.status(201).json({ status: 'success', data: result });
    } catch (err) { next(err); }
  }

  getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const students = await this.userService.getAllStudents();
      res.status(200).json({ status: 'success', students });
    } catch (error) {
      next(error);
    }
  };
  
  getStudentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;

      const student = await this.userService.getStudentById(parseInt(studentId));
      res.status(200).json({
        status: 'success',
        student
      });
    }
    catch (error) {
      next(error);
    }
  };

  updateStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;
      const updatedStudent = await this.userService.updateStudent(parseInt(studentId), req.body);
      res.status(200).json({ status: 'success', student: updatedStudent });
    } catch (error) {
      next(error);
    }
  };

  deleteStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;
      await this.userService.deleteStudent(parseInt(studentId));
      res.status(200).json({ status: 'success', message: 'Student deleted' });
    } catch (error) {
      next(error);
    }
  };

  // Teacher CRUD
  createTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.createTeacher(req.body);
      res.status(201).json({ status: 'success', data: result });
    } catch (err) { next(err); }
  }

  getAllTeachers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teachers = await this.userService.getAllTeachers();
      res.status(200).json({ status: 'success', teachers });
    } catch (error) {
      next(error);
    }
  };

  getTeacherById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { teacherId } = req.params;
      const teacher = await this.userService.getTeacherById(parseInt(teacherId));
      res.status(200).json({
        status: 'success',
        teacher
      });
    } catch (error) {
      next(error);
    }
  };

  updateTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { teacherId } = req.params;
      const updatedTeacher = await this.userService.updateTeacher(parseInt(teacherId), req.body);
      res.status(200).json({ status: 'success', teacher: updatedTeacher });
    } catch (error) {
      next(error);
    }
  };

  deleteTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { teacherId } = req.params;
      await this.userService.deleteTeacher(parseInt(teacherId));
      res.status(200).json({ status: 'success', message: 'Teacher deleted' });
    } catch (error) {
      next(error);
    }
  };

  // Administrator and moderator CRUD
  createAdministrator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.createAdministrator(req.body);
      res.status(201).json({ status: 'success', data: result });
    } catch (err) { next(err); }
  }

  getAllAdministrators = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const administrators = await this.userService.getAllAdministrators();
      res.status(200).json({ status: 'success', administrators });
    } catch (error) {
      next(error);
    }
  };

  updateAdministrator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = parseInt(req.params.id);
      const updatedAdministrator = await this.userService.updateAdministrator(adminId, req.body);
      res.status(200).json({ status: 'success', administrator: updatedAdministrator });
    } catch (error) {
      next(error);
    }
  };

  deleteAdministrator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = Number(req.params.administratorId);
      if (isNaN(adminId)) {
        return res.status(400).json({ error: "Invalid administrator ID" });
      }
      await this.userService.deleteAdministrator(adminId);
      res.status(200).json({ status: 'success', message: 'Administrator deleted' });
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
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const auth0Roles = await this.auth0Service.getUserRoles(user.auth0UserId as string);

      const me = {
        id: user.id,
        auth0Id: user.auth0UserId,
        email: user.email,
        fullName: user.fullName,
        status: user.deletedAt ? 'deactivated' : 'active',
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

  getUserWithRolesById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError('Invalid user ID', 400, 'INVALID_ID');
      const user = await this.userService.getUserWithRolesById(id);
      res.status(200).json({ status: 'success', user });
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
      if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
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
      if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      // Auth0 API for removing roles: DELETE /users/{id}/roles with body { roles: [...] }
      await this.auth0Service.removeRolesFromUser(user.auth0UserId as string, roleIds);      
      res.status(200).json({ status: 'success', message: 'Roles removed' });
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

  changeOwnPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = (req as any).user.id;
      const { newPassword } = req.body;
      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
        throw new AppError('Password must be at least 6 characters long', 400, 'INVALID_PASSWORD');
      }

      const user = await this.userService.getUserById(id);
      if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

      const auth0User = await this.auth0Service.getUserById(user.auth0UserId as string);
      const connection = auth0User?.identities?.[0]?.connection;
      if (connection !== "Username-Password-Authentication") {
        throw new AppError('Cannot change password for social login accounts', 400, 'UNSUPPORTED_CONNECTION');
      }

      await this.auth0Service.changeUserPassword(user.auth0UserId as string, newPassword);
      
      res.status(200).json({ status: 'success', message: 'Password changed' });
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
}

export default UserController;