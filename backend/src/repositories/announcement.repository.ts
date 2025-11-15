import { Op } from 'sequelize';
import { Announcement } from '../models/Announcement';
import { GenericRepository } from './generic.repository';

export class AnnouncementRepository extends GenericRepository<Announcement, number> {
  constructor() {
    super(Announcement);
  }

  async findActive(offset: number = 0, limit?: number): Promise<Announcement[]> {
    const now = new Date();
    return this.model.findAll({
      where: {
        [Op.or]: [
          { visibleUntil: null },
          { visibleUntil: { [Op.gt]: now } }
        ]
      },
      order: [['publishedAt', 'DESC']],
      offset,
      ...(limit && { limit })
    });
  }

  async findByAudience(audience: Announcement['audience'], offset: number = 0, limit?: number): Promise<Announcement[]> {
    const now = new Date();
    return this.model.findAll({
      where: {
        audience,
        [Op.or]: [
          { visibleUntil: null },
          { visibleUntil: { [Op.gt]: now } }
        ]
      },
      order: [['publishedAt', 'DESC']],
      offset,
      ...(limit && { limit })
    });
  }

  async findByPublisher(userId: number, offset: number = 0, limit?: number): Promise<Announcement[]> {
    return this.model.findAll({
      where: {
        publishedByUserId: userId
      },
      order: [['publishedAt', 'DESC']],
      offset,
      ...(limit && { limit })
    });
  }

  async findRecent(page: number = 1, pageSize: number = 10, offset: number = 0): Promise<{
    announcements: Announcement[],
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
  }> {
    const now = new Date();
    
    const { count, rows } = await this.model.findAndCountAll({
      where: {
        [Op.or]: [
          { visibleUntil: null },
          { visibleUntil: { [Op.gt]: now } }
        ]
      },
      order: [['publishedAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize + offset
    });
    
    return {
      announcements: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    };
  }

  async isVisibleToAudience(
    announcementId: number, 
    audience: Announcement['audience'],
    audienceFilterData?: object
  ): Promise<boolean> {
    const announcement = await this.findById(announcementId);
    if (!announcement) return false;
    
    const now = new Date();
    
    if (announcement.visibleUntil && announcement.visibleUntil < now) {
      return false;
    }
    
    // Check audience match
    if (announcement.audience === 'all' || announcement.audience === audience) {
      if (!audienceFilterData) return false;

      return true;
    }
    
    return false;
  }

  async findPinned(page: number = 1, pageSize: number = 10, offset: number = 0): Promise<{
    announcements: Announcement[],
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
  }> {
    const now = new Date();
    
    const { count, rows } = await this.model.findAndCountAll({
      where: {
        pinned: true,
        [Op.or]: [
          { visibleUntil: null },
          { visibleUntil: { [Op.gt]: now } }
        ]
      },
      order: [['publishedAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize + offset
    });
    
    return {
      announcements: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    };
  }

  // Statistics
  async countAll(): Promise<number> {
    return this.model.count();
  }

  async countPinned(): Promise<number> {
    const now = new Date();
    return this.model.count({
      where: {
        pinned: true,
        [Op.or]: [
          { visibleUntil: null },
          { visibleUntil: { [Op.gt]: now } }
        ]
      }
    });
  }

  async countWeekly(): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.model.count({
      where: {
        publishedAt: {
          [Op.gte]: oneWeekAgo
        }
      }
    });
  }
}