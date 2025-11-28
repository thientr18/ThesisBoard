import { Router } from 'express';
import { allowedPermissions } from '../middlewares/permission.middleware';
import { checkJwt } from '../middlewares/auth.middleware';
import { attachUserFromJwt } from '../middlewares/user.middleware';
import { PreThesisController } from '../controllers/pre-thesis.controller';
import { upload } from '../config/multer.config';

const router = Router();
const preThesisController = new PreThesisController();

router.use(checkJwt);
router.use(attachUserFromJwt);

// Topic routes
router.get(
  '/topics/active-semester/own',
  allowedPermissions(['view:topics', 'teacher:all', 'teacher:all', 'moderator:all']),
  preThesisController.getOwnTopicsInActiveSemester
);
router.get(
  '/topics/with-slots',
  allowedPermissions(['view:topics', 'student:pre_thesis', 'student:all', 'teacher:all', 'teacher:all', 'moderator:all']),
  preThesisController.getTopicsWithSlots
);
router.get(
  '/topics/semester/:semesterId',
  allowedPermissions(['view:topics', 'teacher:all', 'teacher:all', 'student:pre_thesis', 'student:all', 'moderator:all']),
  preThesisController.getTopicsBySemester
);
router.get(
  '/topics/:id',
  allowedPermissions(['view:topics', 'teacher:all', 'teacher:all', 'student:pre_thesis', 'student:all', 'moderator:all']),
  preThesisController.getTopicById
);
router.put(
  '/topics/:id',
  allowedPermissions(['update:topics', 'teacher:all', 'teacher:all', 'moderator:all']),
  preThesisController.updateTopic
);
router.delete(
  '/topics/:id',
  allowedPermissions(['delete:topics', 'teacher:all', 'teacher:all', 'moderator:all']),
  preThesisController.deleteTopic
);
router.post(
  '/topics',
  allowedPermissions(['create:topics', 'teacher:all', 'teacher:all', 'moderator:all']),
  preThesisController.createTopic
);
router.post(
  '/topics/:topicId/apply',
  allowedPermissions(['apply:topics', 'student:pre_thesis', 'student:all']),
  preThesisController.applyToTopic
);

// Application routes
router.put(
  '/applications/:id',
  allowedPermissions(['student:pre_thesis', 'student:all']),
  preThesisController.updateApplication
);
router.get(
  '/applications/student/me/:semesterId',
  allowedPermissions(['student:pre_thesis', 'student:all']),
  preThesisController.getMyApplications
);
router.get(
  '/applications/teacher/me/:semesterId',
  allowedPermissions(['teacher:all', 'teacher:all']),
  preThesisController.getApplicationsByTeacher
);
router.get(
  '/topics/:topicId/applications',
  allowedPermissions(['view:topic_applications', 'teacher:all', 'teacher:all', 'student:all', 'moderator:all']),
  preThesisController.getApplicationsByTopic
)
router.get(
  '/applications/:id',
  allowedPermissions(['view:pre_theses', 'teacher:all', 'teacher:all', 'student:all', 'moderator:all', 'admin:all']),
  preThesisController.getApplicationById
);
router.patch(
  '/applications/:id/status',
  allowedPermissions(['update:topic_applications', 'teacher:all', 'moderator:all', 'student:all', 'teacher:all', 'admin:all']),
  preThesisController.updateApplicationStatus
);
router.patch(
  '/applications/:id/cancel',
  allowedPermissions(['update:topic_applications', 'teacher:all', 'moderator:all', 'student:all', 'admin:all']),
  preThesisController.cancelApplicationStatus
);
router.get(
  '/applications',
  allowedPermissions(['view:pre_theses', 'teacher:all', 'teacher:all', 'student:all', 'moderator:all', 'admin:all']),
  preThesisController.getApplications
);

// PreThesis routes
router.get(
  '/pretheses/:id',
  allowedPermissions(['view:pre_theses', 'teacher:all', 'teacher:all', 'student:all', 'moderator:all', 'admin:all']),
  preThesisController.getPreThesisById
);
router.get(
  '/pretheses/student/me',
  allowedPermissions(['student:pre_thesis', 'student:all', 'view:pre_theses', 'moderator:all', 'admin:all']),
  preThesisController.getMyPreTheses
);
router.get(
  '/pretheses/teacher/me/:semesterId',
  allowedPermissions(['teacher:all', 'teacher:all', 'admin:all', 'moderator:all']),
  preThesisController.getPreThesesByTeacher
);
router.get(
  '/pretheses/administrator/me/:semesterId',
  allowedPermissions(['admin:all', 'moderator:all', 'view:pre_theses']),
  preThesisController.getPreThesesByAdministrator
);
router.get(
  '/pretheses',
  allowedPermissions(['view:pre_theses', 'teacher:all', 'teacher:all', 'student:all', 'moderator:all']),
  preThesisController.getPreTheses
);
router.patch(
  '/pretheses/:id/status',
  allowedPermissions(['update:topics', 'teacher:all', 'moderator:all', 'admin:all']),
  preThesisController.updatePreThesisStatus
);
router.patch(
  '/pretheses/:id/grade',
  allowedPermissions(['grade:pre_theses', 'teacher:all', 'moderator:all', 'admin:all']),
  preThesisController.gradePreThesis
);

// Report routes: EXPORT
router.get('/reports/evaluation/:preThesisId',
  allowedPermissions(['export:pre_thesis_reports', 'teacher:all', 'moderator:all']),
  preThesisController.generatePreThesisReportPDF
);

// Statistics routes
router.get(
  '/stats/pretheses/:semesterId',
  allowedPermissions(['view:topic_applications', 'export:pre_thesis_reports', 'teacher:all', 'moderator:all']),
  preThesisController.getPreThesisStats
);

router.get(
  '/stats/applications/:semesterId',
  allowedPermissions(['view:topic_applications', 'export:pre_thesis_reports', 'teacher:all', 'moderator:all']),
  preThesisController.getApplicationStats
);

export default router;