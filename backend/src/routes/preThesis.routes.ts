import { Router } from 'express';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { checkJwt } from '../middlewares/authMiddleware';

import { PreThesisController } from '../controllers/PreThesisController';

const router = Router();
const preThesisController = new PreThesisController();

router.use(checkJwt);

// Topic routes
router.get(
  '/topics',
  roleMiddleware(['view:topics', 'teacher:base', 'student:pre_thesis']),
  preThesisController.getTopics
);

router.get(
  '/topics/:id',
  roleMiddleware(['view:topics', 'teacher:base', 'student:pre_thesis']),
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
  roleMiddleware(['view:topic_applications', 'teacher:base', 'student:pre_thesis']),
  preThesisController.getApplications
);

router.get(
  '/applications/:id',
  roleMiddleware(['view:topic_applications', 'teacher:base', 'student:pre_thesis']),
  preThesisController.getApplicationById
);

router.patch(
  '/applications/:id/status',
  roleMiddleware(['update:topic_applications', 'approve:topic_applications', 'reject:topic_applications', 'teacher:supervisor']),
  preThesisController.updateApplicationStatus
);

router.post(
  '/applications/:id/cancel',
  roleMiddleware(['cancel:topic_applications', 'student:pre_thesis']),
  preThesisController.cancelApplication
);

// PreThesis routes
router.get(
  '/pretheses',
  roleMiddleware(['view:topic_applications', 'teacher:base', 'student:pre_thesis']),
  preThesisController.getPreTheses
);

router.get(
  '/pretheses/:id',
  roleMiddleware(['view:topic_applications', 'teacher:base', 'student:pre_thesis']),
  preThesisController.getPreThesisById
);

router.post(
  '/pretheses',
  roleMiddleware(['create:topics', 'teacher:supervisor', 'moderator:all']),
  preThesisController.createPreThesis
);

router.patch(
  '/pretheses/:id/status',
  roleMiddleware(['update:topics', 'teacher:supervisor']),
  preThesisController.updatePreThesisStatus
);

router.post(
  '/pretheses/:id/grade',
  roleMiddleware(['grade:pre_theses', 'teacher:supervisor']),
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

export default router;