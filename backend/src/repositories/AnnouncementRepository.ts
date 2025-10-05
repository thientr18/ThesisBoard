import { Op } from 'sequelize';
import { Announcement } from '../models/Announcement';
import { GenericRepository } from './GenericRepository';

export class AnnouncementRepository extends GenericRepository<Announcement, number> {
  constructor() {
    super(Announcement);
  }

  async findActive(): Promise<Announcement[]> {
    const now = new Date();
    return this.model.findAll({
      where: {
        [Op.or]: [
          { visibleUntil: null },
          { visibleUntil: { [Op.gt]: now } }
        ]
      },
      order: [['publishedAt', 'DESC']]
    });
  }

  async findByAudience(audience: Announcement['audience']): Promise<Announcement[]> {
    const now = new Date();
    return this.model.findAll({
      where: {
        audience,
        [Op.or]: [
          { visibleUntil: null },
          { visibleUntil: { [Op.gt]: now } }
        ]
      },
      order: [['publishedAt', 'DESC']]
    });
  }

  async findByPublisher(userId: number): Promise<Announcement[]> {
    return this.model.findAll({
      where: {
        publishedByUserId: userId
      },
      order: [['publishedAt', 'DESC']]
    });
  }

  async findByAudienceFilter(filterCriteria: object): Promise<Announcement[]> {
    const now = new Date();

    return this.model.findAll({
      where: {
        audienceFilter: { [Op.ne]: null },
        [Op.or]: [
          { visibleUntil: null },
          { visibleUntil: { [Op.gt]: now } }
        ]
      },
      order: [['publishedAt', 'DESC']]
    });
  }

  async findRecent(page: number = 1, pageSize: number = 10): Promise<{
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
      offset: (page - 1) * pageSize
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
      // If there's no audience filter, it's visible
      if (!announcement.audienceFilter) return true;
      
      // If there's a filter but no filter data provided, can't determine visibility
      if (!audienceFilterData) return false;
      
      // Here you would implement the logic to match audienceFilter with audienceFilterData
      // This is placeholder logic - you'll need to implement actual matching based on your requirements
      return true;
    }
    
    return false;
  }
}