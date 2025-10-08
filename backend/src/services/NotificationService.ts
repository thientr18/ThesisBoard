import { NotificationRepository } from '../repositories/NotificationRepository';
import { Notification } from '../models/Notification';
import { AppError } from '../utils/AppError';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async createNotification(data: {
    userId: number;
    type: string;
    title: string;
    content: string;
    entityType?: string;
    entityId?: number;
  }): Promise<Notification> {
    return this.notificationRepository.create({
      ...data,
      isRead: false,
    });
  }

  async getNotificationsForUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }

  async getUnreadNotificationsForUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.findUnreadByUserId(userId);
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    return this.notificationRepository.countUnreadByUserId(userId);
  }

  async markNotificationAsRead(notificationId: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findById(notificationId);
    
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    
    if (notification.userId !== userId) {
      throw new AppError('Unauthorized access to notification', 403);
    }
    
    const updatedNotification = await this.notificationRepository.markAsRead(notificationId);
    if (!updatedNotification) {
      throw new AppError('Failed to mark notification as read', 500);
    }
    
    return updatedNotification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<number> {
    return this.notificationRepository.markAllAsReadForUser(userId);
  }

  async deleteNotification(notificationId: number, userId: number): Promise<void> {
    const notification = await this.notificationRepository.findById(notificationId);
    
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    
    if (notification.userId !== userId) {
      throw new AppError('Unauthorized access to notification', 403);
    }
    
    await this.notificationRepository.delete(notificationId);
  }

  async deleteAllNotificationsForUser(userId: number): Promise<number> {
    return this.notificationRepository.deleteAllForUser(userId);
  }

  async getPaginatedNotifications(
    userId: number,
    page: number = 1,
    limit: number = 10,
    onlyUnread: boolean = false
  ): Promise<{ notifications: Notification[]; total: number }> {
    return this.notificationRepository.findWithPagination(userId, page, limit, onlyUnread);
  }

  async createSystemNotification(
    userIds: number[],
    title: string,
    content: string,
    type: string = 'SYSTEM'
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const userId of userIds) {
      const notification = await this.createNotification({
        userId,
        type,
        title,
        content
      });
      
      notifications.push(notification);
    }
    
    return notifications;
  }

  async createEntityNotification(
    userIds: number[],
    title: string,
    content: string,
    entityType: string,
    entityId: number,
    type: string = 'ENTITY_UPDATE'
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const userId of userIds) {
      const notification = await this.createNotification({
        userId,
        type,
        title,
        content,
        entityType,
        entityId
      });
      
      notifications.push(notification);
    }
    
    return notifications;
  }
}