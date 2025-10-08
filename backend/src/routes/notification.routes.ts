import { Router } from 'express';
import { checkJwt, requireAdmin } from '../middlewares/authMiddleware';
import { roleMiddleware, requireAllPermissions } from '../middlewares/roleMiddleware';

import { NotificationController } from '../controllers/NotificationController';
const router = Router();
const notificationController = new NotificationController();

router.get('/',
    checkJwt,
    roleMiddleware(['read:notifications']),
    notificationController.getNotifications);

router.get('/unread/count',
    checkJwt,
    roleMiddleware(['read:notifications']),
    notificationController.getUnreadCount);

router.patch('/:id/read',
    checkJwt,
    roleMiddleware(['update:notifications']),
    notificationController.markAsRead);

router.patch('/read-all',
    checkJwt,
    roleMiddleware(['admin:all', 'update:notifications']),
    notificationController.markAllAsRead);

router.delete('/:id',
    checkJwt,
    roleMiddleware(['admin:all', 'delete:notifications']),
    notificationController.deleteNotification);

router.delete('/all',
    checkJwt,
    roleMiddleware(['admin:all', 'delete:notifications']),
    notificationController.deleteAllNotifications);

export default router;