import { UserRepository } from '../repositories/UserRepository';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // Get all users with pagination and filtering
  async getUsers(page: number = 1, limit: number = 10, filters?: any) {
    return this.userRepository.findAllPaginated(page, limit, filters);
  }

  // Get user by ID
  async getUserById(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  // Create a new user
  async createUser(userData: Partial<User>) {
    // Check if username or email already exists
    const existingUsername = await this.userRepository.findByUsername(userData.username!);
    if (existingUsername) {
      throw new AppError('Username already in use', 400);
    }

    const existingEmail = await this.userRepository.findByEmail(userData.email!);
    if (existingEmail) {
      throw new AppError('Email already in use', 400);
    }

    return this.userRepository.create(userData);
  }

  // Update a user
  async updateUser(id: number, userData: Partial<User>) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // If username is being changed, check if new username is available
    if (userData.username && userData.username !== user.username) {
      const existingUsername = await this.userRepository.findByUsername(userData.username);
      if (existingUsername) {
        throw new AppError('Username already in use', 400);
      }
    }

    // If email is being changed, check if new email is available
    if (userData.email && userData.email !== user.email) {
      const existingEmail = await this.userRepository.findByEmail(userData.email);
      if (existingEmail) {
        throw new AppError('Email already in use', 400);
      }
    }

    return this.userRepository.update(id, userData);
  }

  // Delete a user
  async deleteUser(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    return this.userRepository.delete(id);
  }

  // Activate a user
  async activateUser(id: number) {
    const result = await this.userRepository.activateUser(id);
    if (!result) {
      throw new AppError('User not found', 404);
    }
    return result;
  }

  // Deactivate a user
  async deactivateUser(id: number) {
    const result = await this.userRepository.deactivateUser(id);
    if (!result) {
      throw new AppError('User not found', 404);
    }
    return result;
  }

  // Search for users
  async searchUsers(query: string) {
    return this.userRepository.searchUsers(query);
  }

  // Get user with roles
  async getUserWithRoles(id: number) {
    const user = await this.userRepository.getUserWithRoles(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  // Assign role to user
  async assignRoleToUser(userId: number, roleId: number) {
    const success = await this.userRepository.assignRoleToUser(userId, roleId);
    if (!success) {
      throw new AppError('Failed to assign role to user', 500);
    }
    return { success: true };
  }

  // Remove role from user
  async removeRoleFromUser(userId: number, roleId: number) {
    const success = await this.userRepository.removeRoleFromUser(userId, roleId);
    if (!success) {
      throw new AppError('Failed to remove role from user', 500);
    }
    return { success: true };
  }

  // Get users by role
  async getUsersByRole(roleName: string) {
    return this.userRepository.findUsersByRole(roleName);
  }

  // Get user statistics
  async getUserStatistics() {
    const statusCounts = await this.userRepository.countUsersByStatus();
    const roleDistribution = await this.userRepository.getRoleDistribution();
    const userGrowth = await this.userRepository.getUserGrowthByPeriod('month', 6);
    
    return {
      statusCounts,
      roleDistribution,
      userGrowth
    };
  }
}

export default UserService;