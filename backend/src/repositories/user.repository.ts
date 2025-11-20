import { sequelize } from '../models/db';
import { Op } from 'sequelize';
import { GenericRepository } from './generic.repository';
import { User } from '../models/User';
import { fa } from 'zod/locales';

export class UserRepository extends GenericRepository<User, number> {
  constructor() {
    super(User);
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }
  
  async findByAuth0Id(auth0UserId: string): Promise<User | null> {
    return User.findOne({ where: { auth0UserId } });
  }

  async findByAuth0Ids(auth0Ids: string[]): Promise<User[]> {
    return User.findAll({
      where: { auth0UserId: { [Op.in]: auth0Ids } },
      attributes: { exclude: ['auth0UserId', 'createdAt', 'updatedAt'] }
    });
  }

  async findAndCountAll(options: any): Promise<{ rows: User[], count: number }> {
    return User.findAndCountAll(options);
  }

  
  // Advanced queries
  async countUsersByStatus(): Promise<{active: number, inactive: number}> {
    const active = await User.count({ where: { deletedAt: false } });
    const inactive = await User.count({ where: { deletedAt: true } });
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
}