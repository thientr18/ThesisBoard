import { Router } from 'express';
import { checkJwt } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { AnnouncementController } from '../controllers/announcement.controller';

const router = Router();
const announcementController = new AnnouncementController();

// Public
router.get('/public', announcementController.getAnnouncementSlides);

// Protected
// Get all announcements
router.get(
  '/',
  checkJwt,
  roleMiddleware(['view:announcements', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
  announcementController.getAllAnnouncements
);

// Get announcement slides
router.get(
  '/slide',
  checkJwt,
  roleMiddleware(['view:announcements', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
  announcementController.getAnnouncementSlides
);

// Get announcement by ID
router.get(
  '/:id',
  checkJwt,
  roleMiddleware(['view:announcements', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
  announcementController.getAnnouncementById
);

// Create announcement - restricted to staff
router.post(
  '/',
  checkJwt,
  roleMiddleware(['create:announcements', 'admin:all', 'moderator:all', 'access:admin_dashboard']),
  announcementController.createAnnouncement
);

// Update announcement - restricted to staff and original creator
router.put(
  '/:id',
  checkJwt,
  roleMiddleware(['update:announcements', 'admin:all', 'moderator:all']),
  announcementController.updateAnnouncement
);

// Delete announcement - restricted to admin and moderator
router.delete(
  '/:id',
  checkJwt,
  roleMiddleware(['delete:announcements', 'admin:all', 'moderator:all']),
  announcementController.deleteAnnouncement
);

export default router;