import { Router } from 'express';
import { checkJwt } from '../middlewares/auth.middleware';
import { attachUserFromJwt } from '../middlewares/user.middleware';
import { allowedPermissions } from '../middlewares/permission.middleware';
import { ThesisController } from '../controllers/thesis.controller';

const router = Router();
const thesisController = new ThesisController();

router.use(checkJwt);
router.use(attachUserFromJwt);

// ============= THESIS PROPOSAL ROUTES =============
router.post(
  '/proposals',
  allowedPermissions(['submit:thesis_proposals', 'student:thesis', 'admin:all']),
  thesisController.createThesisProposal
);

router.get(
  '/proposals/:id',
  allowedPermissions(['view:thesis_proposals', 'admin:all', 'moderator:all']),
  thesisController.getThesisProposal
);

router.get(
  '/proposals/my',
  allowedPermissions(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getMyThesisProposals
);

router.patch(
  '/proposals/:id/process',
  allowedPermissions(['approve:thesis_proposals', 'teacher:supervisor', 'admin:all']),
  thesisController.processThesisProposal
);

// ============= THESIS REGISTRATION ROUTES =============
router.post(
  '/registrations',
  allowedPermissions(['create:thesis_registrations', 'teacher:supervisor', 'admin:all']),
  thesisController.createThesisRegistration
);

router.get(
  '/registrations',
  allowedPermissions(['view:thesis_proposals', 'teacher:base', 'admin:all', 'moderator:all']),
  thesisController.getThesisRegistrations
);

router.patch(
  '/registrations/:id/process',
  allowedPermissions(['approve:thesis_registrations', 'admin:all', 'moderator:all']),
  thesisController.processThesisRegistration
);

// ============= THESIS ROUTES =============
router.get(
  '/theses/:id',
  allowedPermissions(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getThesis
);

router.get(
  '/theses',
  allowedPermissions(['view:thesis_proposals', 'teacher:base', 'admin:all', 'moderator:all']),
  thesisController.getTheses
);

router.get(
  '/theses/my',
  allowedPermissions(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getMyTheses
);

router.patch(
  '/theses/:id/status',
  allowedPermissions(['update:thesis_proposals', 'teacher:supervisor', 'admin:all', 'moderator:all']),
  thesisController.updateThesisStatus
);

// ============= THESIS ASSIGNMENT ROUTES =============
router.post(
  '/theses/:thesisId/assignments',
  allowedPermissions(['assign:thesis_reviewers', 'assign:committees', 'admin:all', 'moderator:all']),
  thesisController.assignTeacherToThesis
);

router.delete(
  '/theses/:thesisId/assignments',
  allowedPermissions(['assign:thesis_reviewers', 'assign:committees', 'admin:all', 'moderator:all']),
  thesisController.removeTeacherAssignment
);

router.get(
  '/theses/:thesisId/assignments',
  allowedPermissions(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getThesisAssignments
);

// ============= DEFENSE SESSION ROUTES =============
router.post(
  '/defense-sessions',
  allowedPermissions(['schedule:defense_sessions', 'admin:all', 'moderator:all']),
  thesisController.scheduleDefenseSession
);

router.patch(
  '/defense-sessions/:id/reschedule',
  allowedPermissions(['update:defense_sessions', 'admin:all', 'moderator:all']),
  thesisController.rescheduleDefenseSession
);

router.patch(
  '/defense-sessions/:id/complete',
  allowedPermissions(['update:defense_sessions', 'grade:thesis_committees', 'admin:all', 'moderator:all']),
  thesisController.completeDefenseSession
);

router.get(
  '/defense-sessions/upcoming',
  allowedPermissions(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getUpcomingDefenseSessions
);

// ============= THESIS EVALUATION ROUTES =============
router.post(
  '/theses/evaluations',
  allowedPermissions(['grade:thesis_supervisors', 'grade:thesis_reviews', 'grade:thesis_committees', 'teacher:base', 'admin:all']),
  thesisController.submitThesisEvaluation
);

router.get(
  '/theses/:thesisId/evaluations',
  allowedPermissions(['view:thesis_proposals', 'grade:thesis_supervisors', 'grade:thesis_reviews', 'admin:all', 'moderator:all']),
  thesisController.getThesisEvaluations
);

router.get(
  '/theses/:thesisId/final-grade',
  allowedPermissions(['view:thesis_proposals', 'student:thesis', 'teacher:base', 'admin:all']),
  thesisController.getThesisFinalGrade
);

// ============= REPORT ROUTES =============
router.get(
  '/reports/thesis-registration/:registrationId',
  allowedPermissions(['view:reports', 'admin:all', 'moderator:all']),
  thesisController.generateThesisRegistrationReport
);
router.get(
  '/reports/evaluation/:thesisId',
  allowedPermissions(['view:reports', 'admin:all', 'moderator:all']),
  thesisController.generateThesisEvaluationReport
);

export default router;