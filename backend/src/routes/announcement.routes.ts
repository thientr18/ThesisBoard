import { Router } from 'express';
import { checkJwt } from '../middlewares/auth.middleware';
import { attachUserFromJwt } from '../middlewares/user.middleware';
import { allowedPermissions } from '../middlewares/permission.middleware';
import { AnnouncementController } from '../controllers/announcement.controller';

const router = Router();
const announcementController = new AnnouncementController();

// Public
router.get('/public', announcementController.getAnnouncementSlides);

router.use(checkJwt);
router.use(attachUserFromJwt);

router.get(
  '/',
  allowedPermissions(['view:announcements', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
  announcementController.getAllAnnouncements
);


router.get(
  '/pinned',
  allowedPermissions(['view:announcements', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
  announcementController.getPinnedAnnouncements
);

// Get announcement slides
router.get(
  '/slide',
  allowedPermissions(['view:announcements', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
  announcementController.getAnnouncementSlides
);

// Get announcement by ID
router.get(
  '/:id',
  allowedPermissions(['view:announcements', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
  announcementController.getAnnouncementById
);

// Create announcement - restricted to staff
router.post(
  '/',
  allowedPermissions(['create:announcements', 'admin:all', 'moderator:all', 'access:admin_dashboard']),
  announcementController.createAnnouncement
);

// Update announcement - restricted to staff and original creator
router.put(
  '/:id',
  allowedPermissions(['update:announcements', 'admin:all', 'moderator:all']),
  announcementController.updateAnnouncement
);

// Delete announcement - restricted to admin and moderator
router.delete(
  '/:id',
  allowedPermissions(['delete:announcements', 'admin:all', 'moderator:all']),
  announcementController.deleteAnnouncement
);

// For statistics
router.get(
  '/stats/count',
  allowedPermissions(['view:announcements', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
  announcementController.getAnnouncementCount
);

router.get(
  '/stats/pinned/count',
  allowedPermissions(['view:announcements', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
  announcementController.getPinnedAnnouncementCount
);

router.get(
  '/stats/weekly/count',
  allowedPermissions(['view:announcements', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
  announcementController.getWeeklyAnnouncementCount
);

export default router;