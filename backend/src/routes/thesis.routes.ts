import { Router } from 'express';
import { checkJwt } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { ThesisController } from '../controllers/thesis.controller';

const router = Router();
const thesisController = new ThesisController();

// ============= THESIS PROPOSAL ROUTES =============
router.post(
  '/proposals',
  checkJwt,
  roleMiddleware(['submit:thesis_proposals', 'student:thesis', 'admin:all']),
  thesisController.createThesisProposal
);

router.get(
  '/proposals/:id',
  checkJwt,
  roleMiddleware(['view:thesis_proposals', 'admin:all', 'moderator:all']),
  thesisController.getThesisProposal
);

router.get(
  '/proposals/my',
  checkJwt,
  roleMiddleware(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getMyThesisProposals
);

router.patch(
  '/proposals/:id/process',
  checkJwt,
  roleMiddleware(['approve:thesis_proposals', 'teacher:supervisor', 'admin:all']),
  thesisController.processThesisProposal
);

// ============= THESIS REGISTRATION ROUTES =============
router.post(
  '/registrations',
  checkJwt,
  roleMiddleware(['create:thesis_registrations', 'teacher:supervisor', 'admin:all']),
  thesisController.createThesisRegistration
);

router.get(
  '/registrations',
  checkJwt,
  roleMiddleware(['view:thesis_proposals', 'teacher:base', 'admin:all', 'moderator:all']),
  thesisController.getThesisRegistrations
);

router.patch(
  '/registrations/:id/process',
  checkJwt,
  roleMiddleware(['approve:thesis_registrations', 'admin:all', 'moderator:all']),
  thesisController.processThesisRegistration
);

// ============= THESIS ROUTES =============
router.get(
  '/theses/:id',
  checkJwt,
  roleMiddleware(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getThesis
);

router.get(
  '/theses',
  checkJwt,
  roleMiddleware(['view:thesis_proposals', 'teacher:base', 'admin:all', 'moderator:all']),
  thesisController.getTheses
);

router.get(
  '/theses/my',
  checkJwt,
  roleMiddleware(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getMyTheses
);

router.patch(
  '/theses/:id/status',
  checkJwt,
  roleMiddleware(['update:thesis_proposals', 'teacher:supervisor', 'admin:all', 'moderator:all']),
  thesisController.updateThesisStatus
);

// ============= THESIS ASSIGNMENT ROUTES =============
router.post(
  '/theses/:thesisId/assignments',
  checkJwt,
  roleMiddleware(['assign:thesis_reviewers', 'assign:committees', 'admin:all', 'moderator:all']),
  thesisController.assignTeacherToThesis
);

router.delete(
  '/theses/:thesisId/assignments',
  checkJwt,
  roleMiddleware(['assign:thesis_reviewers', 'assign:committees', 'admin:all', 'moderator:all']),
  thesisController.removeTeacherAssignment
);

router.get(
  '/theses/:thesisId/assignments',
  checkJwt,
  roleMiddleware(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getThesisAssignments
);

// ============= DEFENSE SESSION ROUTES =============
router.post(
  '/defense-sessions',
  checkJwt,
  roleMiddleware(['schedule:defense_sessions', 'admin:all', 'moderator:all']),
  thesisController.scheduleDefenseSession
);

router.patch(
  '/defense-sessions/:id/reschedule',
  checkJwt,
  roleMiddleware(['update:defense_sessions', 'admin:all', 'moderator:all']),
  thesisController.rescheduleDefenseSession
);

router.patch(
  '/defense-sessions/:id/complete',
  checkJwt,
  roleMiddleware(['update:defense_sessions', 'grade:thesis_committees', 'admin:all', 'moderator:all']),
  thesisController.completeDefenseSession
);

router.get(
  '/defense-sessions/upcoming',
  checkJwt,
  roleMiddleware(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getUpcomingDefenseSessions
);

// ============= THESIS EVALUATION ROUTES =============
router.post(
  '/theses/evaluations',
  checkJwt,
  roleMiddleware(['grade:thesis_supervisors', 'grade:thesis_reviews', 'grade:thesis_committees', 'teacher:base', 'admin:all']),
  thesisController.submitThesisEvaluation
);

router.get(
  '/theses/:thesisId/evaluations',
  checkJwt,
  roleMiddleware(['view:thesis_proposals', 'grade:thesis_supervisors', 'grade:thesis_reviews', 'admin:all', 'moderator:all']),
  thesisController.getThesisEvaluations
);

router.get(
  '/theses/:thesisId/final-grade',
  checkJwt,
  roleMiddleware(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getThesisFinalGrade
);

// ============= REPORT ROUTES =============
router.get(
  '/reports/thesis-registration/:registrationId',
  checkJwt,
  roleMiddleware(['view:reports', 'admin:all', 'moderator:all']),
  thesisController.generateThesisRegistrationReport
);
router.get(
  '/reports/evaluation/:thesisId',
  checkJwt,
  roleMiddleware(['view:reports', 'admin:all', 'moderator:all']),
  thesisController.generateThesisEvaluationReport
);

export default router;