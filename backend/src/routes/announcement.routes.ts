import { Router } from 'express';
import { checkJwt, requireAdmin } from '../middlewares/authMiddleware';
import { roleMiddleware, requireAllPermissions } from '../middlewares/roleMiddleware';
import { AnnouncementController } from '../controllers/AnnouncementController';
const router = Router();
const announcementController = new AnnouncementController();

router.get('/',
  checkJwt,
  roleMiddleware(['read:announcements']),
  announcementController.getAllAnnouncements
);
router.get('/slide',
  checkJwt,
  roleMiddleware(['read:announcements']),
  announcementController.getAnnouncementSlides
);
router.get('/:id',
  checkJwt,
  roleMiddleware(['read:announcements']),
  announcementController.getAnnouncementById
);

router.post(
  '/',
  checkJwt,
  roleMiddleware(['admin:all', 'moderator:all', 'create:announcements']),
  announcementController.createAnnouncement
);

router.put(
  '/:id',
  checkJwt,
  roleMiddleware(['admin:all', 'moderator:all', 'update:announcements']),
  announcementController.updateAnnouncement
);

router.delete(
  '/:id',
  checkJwt,
  roleMiddleware(['admin:all', 'moderator:all', 'delete:announcements']),
  announcementController.deleteAnnouncement
);

export default router;