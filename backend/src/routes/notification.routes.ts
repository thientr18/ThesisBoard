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
    allowedPermissions(['view:notifications', 'admin:all', 'moderator:all', 'teacher:all', 'student:all']),
    notificationController.getNotifications);

router.get('/unread/count',
    allowedPermissions(['view:notifications', 'admin:all', 'moderator:all', 'teacher:all', 'student:all']),
    notificationController.getUnreadCount);

router.patch('/:id/read',
    allowedPermissions(['manage:notification_settings', 'admin:all', 'moderator:all', 'teacher:all', 'student:all']),
    notificationController.markAsRead);

router.patch('/read-all',
    requireAllPermissions(['manage:notification_settings', 'admin:all', 'moderator:all', 'teacher:all', 'student:all']),
    notificationController.markAllAsRead);

router.delete('/:id',
    allowedPermissions(['delete:notifications', 'admin:all', 'moderator:all', 'teacher:all', 'student:all']),
    notificationController.deleteNotification);

router.delete('/all',
    requireAllPermissions(['delete:notifications', 'manage:notification_settings', 'admin:all', 'moderator:all', 'teacher:all', 'student:all']),
    notificationController.deleteAllNotifications);

export default router;