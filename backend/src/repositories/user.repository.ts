import { sequelize } from '../models/db';
import { Op } from 'sequelize';
import { GenericRepository } from './generic.repository';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { Teacher } from '../models/Teacher';
import type { StudentDetails, TeacherDetails } from '../types/user.types';

export class UserRepository extends GenericRepository<User, number> {
  constructor() {
    super(User);
  }
  
  // Basic user lookups
  async findByUsername(username: string): Promise<User | null> {
    return User.findOne({ where: { username } });
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }
  
  async findByAuth0Id(auth0UserId: string): Promise<User | null> {
    return User.findOne({ where: { auth0UserId } });
  }
  
  // User search and filtering
  async searchUsers(query: string): Promise<User[]> {
    return User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } },
          { fullName: { [Op.like]: `%${query}%` } }
        ]
      }
    });
  }
  
  async findActiveUsers(): Promise<User[]> {
    return User.findAll({
      where: { status: 'active' }
    });
  }
  
  async findInactiveUsers(): Promise<User[]> {
    return User.findAll({
      where: { status: 'inactive' }
    });
  }

  /**
   * Update user status by auth0UserId.
   */
  async updateUserStatus(auth0UserId: string, status: 'active' | 'inactive'): Promise<User | null> {
    const user = await this.findByAuth0Id(auth0UserId);
    if (!user) return null;
    return user.update({ status });
  }
  
  // User status management
  async activateUser(id: number): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;
    
    return user.update({ status: 'active' });
  }
  
  async deactivateUser(id: number): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;
    
    return user.update({ status: 'inactive' });
  }

    /**
   * Create or update a user record based on auth0UserId (preferred) or email.
   * Performs minimal field synchronization.
   */
  async createOrUpdateUser(userData: {
    auth0UserId: string;
    email?: string;
    username?: string;
    fullName?: string;
    status?: 'active' | 'inactive';
  }): Promise<User> {
    const { auth0UserId, email } = userData;

    let existing = await this.findByAuth0Id(auth0UserId);

    // Fallback: try match by email if no auth0UserId stored yet
    if (!existing && email) {
      existing = await this.findByEmail(email);
    }

    if (!existing) {
      return User.create({
        auth0UserId,
        email: email ?? `${auth0UserId}@placeholder.local`,
        username: userData.username ?? auth0UserId,
        fullName: userData.fullName ?? userData.username ?? 'Unnamed User',
        status: userData.status ?? 'active',
      } as any);
    }

    // Update only changed fields to avoid overwriting local edits inadvertently
    const updates: Partial<User> = {};
    if (userData.email && userData.email !== existing.email) updates.email = userData.email;
    if (userData.username && userData.username !== existing.username) updates.username = userData.username;
    if (userData.fullName && userData.fullName !== existing.fullName) updates.fullName = userData.fullName;
    if (userData.status && userData.status !== existing.status) updates.status = userData.status;

    if (Object.keys(updates).length) {
      await existing.update(updates);
    }

    return existing;
  }
  
  // Advanced queries
  async countUsersByStatus(): Promise<{active: number, inactive: number}> {
    const active = await User.count({ where: { status: 'active' } });
    const inactive = await User.count({ where: { status: 'inactive' } });
    return { active, inactive };
  }

  // Pagination
  async findAllPaginated(page: number = 1, limit: number = 10, filters?: any): Promise<{rows: User[], count: number}> {
    return User.findAndCountAll({
      where: filters || {},
      limit,
      offset: (page - 1) * limit
    });
  }

  // multiple conditions and sorting
  async findWithAdvancedFilters(options: {
    filters?: any,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
    page?: number,
    limit?: number,
  }): Promise<{rows: User[], count: number}> {
    const { filters, sortBy = 'id', sortOrder = 'ASC', page = 1, limit = 10 } = options;

    const queryOptions: any = {
      where: filters || {},
      order: [[sortBy, sortOrder]],
      limit,
      offset: (page - 1) * limit
    };
    
    return User.findAndCountAll(queryOptions);
  }

  // User creation over time
  async getUserGrowthByPeriod(period: 'day' | 'week' | 'month' | 'year', limit: number = 10): Promise<{period: string, count: number}[]> {
    let dateFormat;
    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u'; // ISO week number
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
    }
    
    const result = await User.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'period'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['period'],
      order: [[sequelize.literal('period'), 'DESC']],
      limit,
      raw: true
    });
    
    return result.map((item: any) => ({
      period: item.period,
      count: parseInt(item.count, 10)
    }));
  }

  // STUDENT
  async getStudentDetails(userId: number): Promise<StudentDetails | null> {
    return Student.findOne({ where: { userId } }) as unknown as StudentDetails | null;
  }

  async getStudentById(userId: number): Promise<StudentDetails | null> {
    return Student.findOne({ where: { userId } }) as unknown as StudentDetails | null;
  }

  // TEACHER
  async getTeacherDetails(userId: number): Promise<TeacherDetails | null> {
    return Teacher.findOne({ where: { userId } }) as unknown as TeacherDetails | null;
  }

  async getTeacherById(userId: number): Promise<TeacherDetails | null> {
    return Teacher.findOne({ where: { userId } }) as unknown as TeacherDetails | null;
  }
}