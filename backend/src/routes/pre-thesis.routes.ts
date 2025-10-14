import { Router } from 'express';
import { roleMiddleware } from '../middlewares/role.middleware';
import { checkJwt } from '../middlewares/auth.middleware';
import { PreThesisController } from '../controllers/pre-thesis.controller';

const router = Router();
const preThesisController = new PreThesisController();

router.use(checkJwt);

// Topic routes
router.get(
  '/topics',
  roleMiddleware(['view:topics', 'teacher:base', 'teacher:supervisor', 'student:pre_thesis', 'moderator:all']),
  preThesisController.getTopics
);

router.get(
  '/topics/:id',
  roleMiddleware(['view:topics', 'teacher:base', 'teacher:supervisor', 'student:pre_thesis', 'moderator:all']),
  preThesisController.getTopicById
);

// Application routes
router.post(
  '/topics/:topicId/applications/:studentId',
  roleMiddleware(['apply:topics', 'student:pre_thesis']),
  preThesisController.applyToTopic
);

router.get(
  '/applications',
  roleMiddleware(['view:topic_applications', 'teacher:base', 'teacher:supervisor', 'student:pre_thesis', 'moderator:all']),
  preThesisController.getApplications
);

router.get(
  '/applications/:id',
  roleMiddleware(['view:topic_applications', 'teacher:base', 'teacher:supervisor', 'student:pre_thesis', 'moderator:all']),
  preThesisController.getApplicationById
);

router.patch(
  '/applications/:id/status',
  roleMiddleware(['update:topic_applications', 'approve:topic_applications', 'reject:topic_applications', 'teacher:supervisor', 'moderator:all']),
  preThesisController.updateApplicationStatus
);

router.post(
  '/applications/:id/cancel',
  roleMiddleware(['cancel:topic_applications', 'student:pre_thesis', 'moderator:all']),
  preThesisController.cancelApplication
);

// PreThesis routes
router.get(
  '/pretheses',
  roleMiddleware(['view:topic_applications', 'teacher:base', 'teacher:supervisor', 'student:pre_thesis', 'moderator:all']),
  preThesisController.getPreTheses
);

router.get(
  '/pretheses/:id',
  roleMiddleware(['view:topic_applications', 'teacher:base', 'teacher:supervisor', 'student:pre_thesis', 'moderator:all']),
  preThesisController.getPreThesisById
);

router.post(
  '/pretheses',
  roleMiddleware(['create:topics', 'teacher:supervisor', 'moderator:all']),
  preThesisController.createPreThesis
);

router.patch(
  '/pretheses/:id/status',
  roleMiddleware(['update:topics', 'teacher:supervisor', 'moderator:all']),
  preThesisController.updatePreThesisStatus
);

router.post(
  '/pretheses/:id/grade',
  roleMiddleware(['grade:pre_theses', 'teacher:supervisor', 'moderator:all']),
  preThesisController.gradePreThesis
);

router.post(
  '/pretheses/:id/cancel',
  roleMiddleware(['update:topics', 'teacher:supervisor', 'moderator:all']),
  preThesisController.cancelPreThesis
);

// Statistics routes
router.get(
  '/stats/pretheses/:semesterId',
  roleMiddleware(['view:topic_applications', 'export:pre_thesis_reports', 'teacher:supervisor', 'moderator:all']),
  preThesisController.getPreThesisStats
);

router.get(
  '/stats/applications/:semesterId',
  roleMiddleware(['view:topic_applications', 'export:pre_thesis_reports', 'teacher:supervisor', 'moderator:all']),
  preThesisController.getApplicationStats
);

// Report routes: EXPORT

export default router;