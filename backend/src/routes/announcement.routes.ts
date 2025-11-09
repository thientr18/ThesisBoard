import { Router } from 'express';
import { checkJwt } from '../middlewares/auth.middleware';
import { attachUserFromJwt } from '../middlewares/user.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { AnnouncementController } from '../controllers/announcement.controller';

const router = Router();
const announcementController = new AnnouncementController();

// Public
router.get('/public', announcementController.getAnnouncementSlides);

router.use(checkJwt);
router.use(attachUserFromJwt);

router.get(
  '/',
  roleMiddleware(['view:announcements', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
  announcementController.getAllAnnouncements
);

// Get announcement slides
router.get(
  '/slide',
  roleMiddleware(['view:announcements', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
  announcementController.getAnnouncementSlides
);

// Get announcement by ID
router.get(
  '/:id',
  roleMiddleware(['view:announcements', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
  announcementController.getAnnouncementById
);

// Create announcement - restricted to staff
router.post(
  '/',
  roleMiddleware(['create:announcements', 'admin:all', 'moderator:all', 'access:admin_dashboard']),
  announcementController.createAnnouncement
);

// Update announcement - restricted to staff and original creator
router.put(
  '/:id',
  roleMiddleware(['update:announcements', 'admin:all', 'moderator:all']),
  announcementController.updateAnnouncement
);

// Delete announcement - restricted to admin and moderator
router.delete(
  '/:id',
  roleMiddleware(['delete:announcements', 'admin:all', 'moderator:all']),
  announcementController.deleteAnnouncement
);

export default router;