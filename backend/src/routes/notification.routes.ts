import { Router } from 'express';
import { checkJwt, requireAdmin } from '../middlewares/auth.middleware';
import { roleMiddleware, requireAllPermissions } from '../middlewares/role.middleware';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();
const notificationController = new NotificationController();

router.use(checkJwt);

router.get('/',
    roleMiddleware(['view:notifications']),
    notificationController.getNotifications);

router.get('/unread/count',
    roleMiddleware(['view:notifications']),
    notificationController.getUnreadCount);

router.patch('/:id/read',
    roleMiddleware(['manage:notification_settings']),
    notificationController.markAsRead);

router.patch('/read-all',
    requireAllPermissions(['manage:notification_settings']),
    notificationController.markAllAsRead);

router.delete('/:id',
    roleMiddleware(['delete:notifications']),
    notificationController.deleteNotification);

router.delete('/all',
    requireAllPermissions(['delete:notifications', 'manage:notification_settings']),
    notificationController.deleteAllNotifications);

export default router;