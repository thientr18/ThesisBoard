import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { AppError } from '../utils/AppError';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED'));
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const onlyUnread = req.query.onlyUnread === 'true';

      const result = await this.notificationService.getPaginatedNotifications(
        userId,
        page,
        limit,
        onlyUnread
      );

      return res.status(200).json({
        success: true,
        data: result.notifications,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED'));
      }

      const count = await this.notificationService.getUnreadNotificationCount(userId);

      return res.status(200).json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED'));
      }

      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return next(new AppError('Invalid notification ID', 400, 'INVALID_NOTIFICATION_ID'));
      }

      const notification = await this.notificationService.markNotificationAsRead(notificationId, userId);

      return res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED'));
      }

      const updatedCount = await this.notificationService.markAllNotificationsAsRead(userId);

      return res.status(200).json({
        success: true,
        data: { updatedCount }
      });
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED'));
      }

      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return next(new AppError('Invalid notification ID', 400, 'INVALID_NOTIFICATION_ID'));
      }

      await this.notificationService.deleteNotification(notificationId, userId);

      return res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAllNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED'));
      }

      const deletedCount = await this.notificationService.deleteAllNotificationsForUser(userId);

      return res.status(200).json({
        success: true,
        data: { deletedCount }
      });
    } catch (error) {
      next(error);
    }
  };
}