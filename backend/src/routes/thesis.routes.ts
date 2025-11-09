import { Router } from 'express';
import { checkJwt } from '../middlewares/auth.middleware';
import { attachUserFromJwt } from '../middlewares/user.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { ThesisController } from '../controllers/thesis.controller';

const router = Router();
const thesisController = new ThesisController();

router.use(checkJwt);
router.use(attachUserFromJwt);

// ============= THESIS PROPOSAL ROUTES =============
router.post(
  '/proposals',
  roleMiddleware(['submit:thesis_proposals', 'student:thesis', 'admin:all']),
  thesisController.createThesisProposal
);

router.get(
  '/proposals/:id',
  roleMiddleware(['view:thesis_proposals', 'admin:all', 'moderator:all']),
  thesisController.getThesisProposal
);

router.get(
  '/proposals/my',
  roleMiddleware(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getMyThesisProposals
);

router.patch(
  '/proposals/:id/process',
  roleMiddleware(['approve:thesis_proposals', 'teacher:supervisor', 'admin:all']),
  thesisController.processThesisProposal
);

// ============= THESIS REGISTRATION ROUTES =============
router.post(
  '/registrations',
  roleMiddleware(['create:thesis_registrations', 'teacher:supervisor', 'admin:all']),
  thesisController.createThesisRegistration
);

router.get(
  '/registrations',
  roleMiddleware(['view:thesis_proposals', 'teacher:base', 'admin:all', 'moderator:all']),
  thesisController.getThesisRegistrations
);

router.patch(
  '/registrations/:id/process',
  roleMiddleware(['approve:thesis_registrations', 'admin:all', 'moderator:all']),
  thesisController.processThesisRegistration
);

// ============= THESIS ROUTES =============
router.get(
  '/theses/:id',
  roleMiddleware(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getThesis
);

router.get(
  '/theses',
  roleMiddleware(['view:thesis_proposals', 'teacher:base', 'admin:all', 'moderator:all']),
  thesisController.getTheses
);

router.get(
  '/theses/my',
  roleMiddleware(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getMyTheses
);

router.patch(
  '/theses/:id/status',
  roleMiddleware(['update:thesis_proposals', 'teacher:supervisor', 'admin:all', 'moderator:all']),
  thesisController.updateThesisStatus
);

// ============= THESIS ASSIGNMENT ROUTES =============
router.post(
  '/theses/:thesisId/assignments',
  roleMiddleware(['assign:thesis_reviewers', 'assign:committees', 'admin:all', 'moderator:all']),
  thesisController.assignTeacherToThesis
);

router.delete(
  '/theses/:thesisId/assignments',
  roleMiddleware(['assign:thesis_reviewers', 'assign:committees', 'admin:all', 'moderator:all']),
  thesisController.removeTeacherAssignment
);

router.get(
  '/theses/:thesisId/assignments',
  roleMiddleware(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getThesisAssignments
);

// ============= DEFENSE SESSION ROUTES =============
router.post(
  '/defense-sessions',
  roleMiddleware(['schedule:defense_sessions', 'admin:all', 'moderator:all']),
  thesisController.scheduleDefenseSession
);

router.patch(
  '/defense-sessions/:id/reschedule',
  roleMiddleware(['update:defense_sessions', 'admin:all', 'moderator:all']),
  thesisController.rescheduleDefenseSession
);

router.patch(
  '/defense-sessions/:id/complete',
  roleMiddleware(['update:defense_sessions', 'grade:thesis_committees', 'admin:all', 'moderator:all']),
  thesisController.completeDefenseSession
);

router.get(
  '/defense-sessions/upcoming',
  roleMiddleware(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getUpcomingDefenseSessions
);

// ============= THESIS EVALUATION ROUTES =============
router.post(
  '/theses/evaluations',
  roleMiddleware(['grade:thesis_supervisors', 'grade:thesis_reviews', 'grade:thesis_committees', 'teacher:base', 'admin:all']),
  thesisController.submitThesisEvaluation
);

router.get(
  '/theses/:thesisId/evaluations',
  roleMiddleware(['view:thesis_proposals', 'grade:thesis_supervisors', 'grade:thesis_reviews', 'admin:all', 'moderator:all']),
  thesisController.getThesisEvaluations
);

router.get(
  '/theses/:thesisId/final-grade',
  roleMiddleware(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getThesisFinalGrade
);

// ============= REPORT ROUTES =============
router.get(
  '/reports/thesis-registration/:registrationId',
  roleMiddleware(['view:reports', 'admin:all', 'moderator:all']),
  thesisController.generateThesisRegistrationReport
);
router.get(
  '/reports/evaluation/:thesisId',
  roleMiddleware(['view:reports', 'admin:all', 'moderator:all']),
  thesisController.generateThesisEvaluationReport
);

export default router;