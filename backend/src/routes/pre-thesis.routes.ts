import { Router } from 'express';
import { allowedPermissions } from '../middlewares/permission.middleware';
import { checkJwt } from '../middlewares/auth.middleware';
import { attachUserFromJwt } from '../middlewares/user.middleware';
import { PreThesisController } from '../controllers/pre-thesis.controller';

const router = Router();
const preThesisController = new PreThesisController();

router.use(checkJwt);
router.use(attachUserFromJwt);

// Topic routes
router.get(
  '/topics',
  allowedPermissions(['view:topics', 'teacher:base', 'teacher:supervisor', 'student:pre_thesis', 'moderator:all']),
  preThesisController.getTopics
);

router.get(
  '/topics/:id',
  allowedPermissions(['view:topics', 'teacher:base', 'teacher:supervisor', 'student:pre_thesis', 'moderator:all']),
  preThesisController.getTopicById
);

// Application routes
router.post(
  '/applications/:topicId/:studentId',
  allowedPermissions(['apply:topics', 'student:pre_thesis']),
  preThesisController.applyToTopic
);

router.get(
  '/applications',
  allowedPermissions(['view:topic_applications', 'teacher:base', 'teacher:supervisor', 'student:pre_thesis', 'moderator:all']),
  preThesisController.getApplications
);

router.get(
  '/applications/:id',
  allowedPermissions(['view:topic_applications', 'teacher:base', 'teacher:supervisor', 'student:pre_thesis', 'moderator:all']),
  preThesisController.getApplicationById
);

router.patch(
  '/applications/:id/status',
  allowedPermissions(['update:topic_applications', 'approve:topic_applications', 'reject:topic_applications', 'teacher:supervisor', 'moderator:all']),
  preThesisController.updateApplicationStatus
);

router.post(
  '/applications/:id/cancel',
  allowedPermissions(['cancel:topic_applications', 'student:pre_thesis', 'moderator:all']),
  preThesisController.cancelApplication
);

// PreThesis routes
router.get(
  '/pretheses',
  allowedPermissions(['view:topic_applications', 'teacher:base', 'teacher:supervisor', 'student:pre_thesis', 'moderator:all']),
  preThesisController.getPreTheses
);

router.get(
  '/pretheses/:id',
  allowedPermissions(['view:topic_applications', 'teacher:base', 'teacher:supervisor', 'student:pre_thesis', 'moderator:all']),
  preThesisController.getPreThesisById
);

router.post(
  '/pretheses',
  allowedPermissions(['create:topics', 'teacher:supervisor', 'moderator:all']),
  preThesisController.createPreThesis
);

router.patch(
  '/pretheses/:id/status',
  allowedPermissions(['update:topics', 'teacher:supervisor', 'moderator:all']),
  preThesisController.updatePreThesisStatus
);

router.post(
  '/pretheses/:id/grade',
  allowedPermissions(['grade:pre_theses', 'teacher:supervisor', 'moderator:all']),
  preThesisController.gradePreThesis
);

router.post(
  '/pretheses/:id/cancel',
  allowedPermissions(['update:topics', 'teacher:supervisor', 'moderator:all']),
  preThesisController.cancelPreThesis
);

// Statistics routes
router.get(
  '/stats/pretheses/:semesterId',
  allowedPermissions(['view:topic_applications', 'export:pre_thesis_reports', 'teacher:supervisor', 'moderator:all']),
  preThesisController.getPreThesisStats
);

router.get(
  '/stats/applications/:semesterId',
  allowedPermissions(['view:topic_applications', 'export:pre_thesis_reports', 'teacher:supervisor', 'moderator:all']),
  preThesisController.getApplicationStats
);

// Report routes: EXPORT
router.get('/reports/evaluation/:preThesisId',
  allowedPermissions(['export:pre_thesis_reports', 'teacher:supervisor', 'moderator:all']),
  preThesisController.generatePreThesisReportPDF
);

export default router;