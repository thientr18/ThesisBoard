import { Notification } from '../models/Notification';
import { GenericRepository } from './GenericRepository';
import { Op } from 'sequelize';

export class NotificationRepository extends GenericRepository<Notification, number> {
  constructor() {
    super(Notification);
  }

  async findByUserId(userId: number): Promise<Notification[]> {
    return this.model.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  }

  async findUnreadByUserId(userId: number): Promise<Notification[]> {
    return this.model.findAll({
      where: {
        userId,
        isRead: false
      },
      order: [['createdAt', 'DESC']]
    });
  }

  async countUnreadByUserId(userId: number): Promise<number> {
    return this.model.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  async markAsRead(notificationId: number): Promise<Notification | null> {
    return this.update(notificationId, { isRead: true });
  }

  async markAllAsReadForUser(userId: number): Promise<number> {
    const [updatedCount] = await this.model.update(
      { isRead: true },
      {
        where: {
          userId,
          isRead: false
        }
      }
    );
    return updatedCount;
  }

  async findByEntityTypeAndId(entityType: string, entityId: number): Promise<Notification[]> {
    return this.model.findAll({
      where: {
        entityType,
        entityId
      },
      order: [['createdAt', 'DESC']]
    });
  }

  async findByType(type: string): Promise<Notification[]> {
    return this.model.findAll({
      where: { type },
      order: [['createdAt', 'DESC']]
    });
  }

  async deleteAllForUser(userId: number): Promise<number> {
    const deleted = await this.model.destroy({
      where: { userId }
    });
    return deleted;
  }

  async findWithPagination(
    userId: number,
    page: number = 1,
    limit: number = 10,
    onlyUnread: boolean = false
  ): Promise<{ notifications: Notification[], total: number }> {
    const whereClause: any = { userId };
    
    if (onlyUnread) {
      whereClause.isRead = false;
    }
    
    const { count, rows } = await this.model.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });
    
    return {
      notifications: rows,
      total: count
    };
  }
}