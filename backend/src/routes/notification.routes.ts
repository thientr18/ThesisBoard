import { Router } from 'express';
import { checkJwt, requireAdmin } from '../middlewares/auth.middleware';
import { allowedPermissions, requireAllPermissions } from '../middlewares/permission.middleware';
import { NotificationController } from '../controllers/notification.controller';
import { attachUserFromJwt } from '../middlewares/user.middleware';

const router = Router();
const notificationController = new NotificationController();

router.use(checkJwt);
router.use(attachUserFromJwt);

router.get('/',
    allowedPermissions(['view:notifications']),
    notificationController.getNotifications);

router.get('/unread/count',
    allowedPermissions(['view:notifications']),
    notificationController.getUnreadCount);

router.patch('/:id/read',
    allowedPermissions(['manage:notification_settings']),
    notificationController.markAsRead);

router.patch('/read-all',
    requireAllPermissions(['manage:notification_settings']),
    notificationController.markAllAsRead);

router.delete('/:id',
    allowedPermissions(['delete:notifications']),
    notificationController.deleteNotification);

router.delete('/all',
    requireAllPermissions(['delete:notifications', 'manage:notification_settings']),
    notificationController.deleteAllNotifications);

export default router;