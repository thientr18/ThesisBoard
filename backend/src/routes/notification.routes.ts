import { Router } from 'express';
import { checkJwt, requireAdmin } from '../middlewares/authMiddleware';
import { roleMiddleware, requireAllPermissions } from '../middlewares/roleMiddleware';

import { NotificationController } from '../controllers/NotificationController';

const router = Router();
const notificationController = new NotificationController();

router.use(checkJwt);

router.get('/',
    roleMiddleware(['read:notifications']),
    notificationController.getNotifications);

router.get('/unread/count',
    roleMiddleware(['read:notifications']),
    notificationController.getUnreadCount);

router.patch('/:id/read',
    roleMiddleware(['update:notifications']),
    notificationController.markAsRead);

router.patch('/read-all',
    roleMiddleware(['admin:all', 'update:notifications']),
    notificationController.markAllAsRead);

router.delete('/:id',
    roleMiddleware(['admin:all', 'delete:notifications']),
    notificationController.deleteNotification);

router.delete('/all',
    roleMiddleware(['admin:all', 'delete:notifications']),
    notificationController.deleteAllNotifications);

export default router;