import { sequelize } from '../models/db';
import { Op } from 'sequelize';
import { GenericRepository } from './GenericRepository';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { UserRole } from '../models/UserRole';

export class UserRepository extends GenericRepository<User, number> {
  constructor() {
    super(User);
  }
  
  // Basic user lookups
  async findByUsername(username: string): Promise<User | null> {
    return User.findOne({
      where: { username }
    });
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({
      where: { email }
    });
  }
  
  async findByAuth0Id(auth0UserId: string): Promise<User | null> {
    return User.findOne({
      where: { auth0UserId }
    });
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
  
  // Role-based user operations
  async findUsersByRole(roleName: string): Promise<User[]> {
    return User.findAll({
      include: [{
        model: Role,
        where: { name: roleName },
        through: { attributes: [] }
      }]
    });
  }
  
  async getUserWithRoles(userId: number): Promise<User | null> {
    return User.findByPk(userId, {
      include: [{
        model: Role,
        through: { attributes: [] }
      }]
    });
  }
  
  async assignRoleToUser(userId: number, roleId: number): Promise<boolean> {
    try {
      await UserRole.create({ 
        userId, 
        roleId 
      } as any);
      return true;
    } catch (error) {
      console.error('Error assigning role to user:', error);
      return false;
    }
  }
  
  async removeRoleFromUser(userId: number, roleId: number): Promise<boolean> {
    try {
      const deleted = await UserRole.destroy({
        where: { userId, roleId }
      });
      return deleted > 0;
    } catch (error) {
      console.error('Error removing role from user:', error);
      return false;
    }
  }
  
  // Bulk operations
  async bulkCreateUsers(users: Partial<User>[]): Promise<User[]> {
    return User.bulkCreate(users as any);
  }
  
  // Advanced queries
  async countUsersByStatus(): Promise<{active: number, inactive: number}> {
    const active = await User.count({ where: { status: 'active' } });
    const inactive = await User.count({ where: { status: 'inactive' } });
    return { active, inactive };
  }

  // Admin dashboard
  async findAdministrativeUsers(): Promise<User[]> {
    return User.findAll({
      include: [{
        model: Role,
        where: { name: { [Op.in]: ['admin', 'moderator'] } },
        through: { attributes: [] }
      }]
    });
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
    includeRoles?: boolean
  }): Promise<{rows: User[], count: number}> {
    const { filters, sortBy = 'id', sortOrder = 'ASC', page = 1, limit = 10, includeRoles = false } = options;
    
    const queryOptions: any = {
      where: filters || {},
      order: [[sortBy, sortOrder]],
      limit,
      offset: (page - 1) * limit
    };
    
    if (includeRoles) {
      queryOptions.include = [{
        model: Role,
        through: { attributes: [] }
      }];
    }
    
    return User.findAndCountAll(queryOptions);
  }

  // Role distribution statistics
async getRoleDistribution(): Promise<{role: string, count: number}[]> {
  const result = await Role.findAll({
    attributes: [
      'name',
      [sequelize.fn('COUNT', sequelize.col('users.id')), 'userCount']
    ],
    include: [{
      model: User,
      through: { attributes: [] },
      attributes: []
    }],
    group: ['Role.name'],
    raw: true
  });
  
  return result.map((item: any) => ({
    role: item.name,
    count: parseInt(item.userCount, 10)
  }));
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
}