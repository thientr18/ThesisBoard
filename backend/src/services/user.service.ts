import { UserRepository } from '../repositories/user-repository';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import type { StudentDetails, TeacherDetails } from '../types/user.types';

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
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  async findByAuth0UserId(auth0UserId: string): Promise<User | null> {
    return User.findOne({ where: { auth0UserId } });
  }

  async getOrCreateByAuth0UserId(auth0UserId: string, defaults?: Partial<User>): Promise<User> {
    const [user] = await User.findOrCreate({
      where: { auth0UserId },
      defaults: {
        username: defaults?.username ?? auth0UserId,
        email: defaults?.email ?? `${auth0UserId}@placeholder.local`,
        fullName: defaults?.fullName ?? 'Unnamed User',
        status: defaults?.status ?? 'active',
        auth0UserId,
      } as any,
    });
    return user;
  }

  // Create a new user
  async createUser(userData: Partial<User>) {
    // Check if username or email already exists
    const existingUsername = await this.userRepository.findByUsername(userData.username!);
    if (existingUsername) {
      throw new AppError('Username already in use', 400, 'USERNAME_IN_USE');
    }

    const existingEmail = await this.userRepository.findByEmail(userData.email!);
    if (existingEmail) {
      throw new AppError('Email already in use', 400, 'EMAIL_IN_USE');
    }

    return this.userRepository.create(userData);
  }

  // Update a user
  async updateUser(id: number, userData: Partial<User>) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // If username is being changed, check if new username is available
    if (userData.username && userData.username !== user.username) {
      const existingUsername = await this.userRepository.findByUsername(userData.username);
      if (existingUsername) {
        throw new AppError('Username already in use', 400, 'USERNAME_IN_USE');
      }
    }

    // If email is being changed, check if new email is available
    if (userData.email && userData.email !== user.email) {
      const existingEmail = await this.userRepository.findByEmail(userData.email);
      if (existingEmail) {
        throw new AppError('Email already in use', 400, 'EMAIL_IN_USE');
      }
    }

    return this.userRepository.update(id, userData);
  }

  // Delete a user
  async deleteUser(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    return this.userRepository.delete(id);
  }

  // Activate a user
  async activateUser(id: number) {
    const result = await this.userRepository.activateUser(id);
    if (!result) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return result;
  }

  // Deactivate a user
  async deactivateUser(id: number) {
    const result = await this.userRepository.deactivateUser(id);
    if (!result) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return result;
  }

  // Search for users
  async searchUsers(query: string) {
    return this.userRepository.searchUsers(query);
  }

  // Get user statistics
  async getUserStatistics() {
    const statusCounts = await this.userRepository.countUsersByStatus();
    // const roleDistribution = await this.userRepository.getUsers(truyền vào những ids có role trong Auth0);
    const userGrowth = await this.userRepository.getUserGrowthByPeriod('month', 6);
    
    return {
      statusCounts,
      // roleDistribution,
      userGrowth
    };
  }
  
  // STUDENT
  async getStudentDetails(userId: number): Promise<StudentDetails | null> {
    return await this.userRepository.getStudentDetails(userId);
  }

  async getStudentById(userId: number): Promise<StudentDetails | null> {
    return await this.userRepository.getStudentById(userId);
  }

  // TEACHER
  async getTeacherDetails(userId: number): Promise<TeacherDetails | null> {
    return await this.userRepository.getTeacherDetails(userId);
  }

  async getTeacherById(userId: number): Promise<TeacherDetails | null> {
    return await this.userRepository.getTeacherById(userId);
  }
}

export default UserService;