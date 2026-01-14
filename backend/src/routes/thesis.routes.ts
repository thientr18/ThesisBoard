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
  allowedPermissions(['submit:thesis_proposals', 'student:all', 'admin:all', 'moderator:all']),
  thesisController.createThesisProposal
);

router.get(
  '/proposals/:id',
  allowedPermissions(['view:thesis_proposals', 'admin:all', 'moderator:all']),
  thesisController.getThesisProposal
);

router.patch(
  '/proposals/:id/process',
  allowedPermissions(['approve:thesis_proposals', 'teacher:all', 'admin:all', 'moderator:all']),
  thesisController.processThesisProposal
);

router.patch(
  '/proposals/:id/cancel',
  allowedPermissions(['approve:thesis_proposals', 'teacher:all', 'admin:all', 'moderator:all', 'student:all']),
  thesisController.cancelThesisProposal
);

router.get(
  '/proposals/teacher/:semesterId',
  allowedPermissions(['view:thesis_proposals', 'teacher:all', 'admin:all', 'moderator:all', 'student:all']),
  thesisController.getTeacherAvailable
);

router.get(
  '/proposals/student/me/:semesterId',
  allowedPermissions(['view:thesis_proposals', 'student:all']),
  thesisController.getMyThesisProposalsForStudent
);

router.get(
  '/proposals/teacher/me/:semesterId',
  allowedPermissions(['view:thesis_proposals', 'teacher:all']),
  thesisController.getMyThesisProposalsForTeacher
);

router.put(
  '/proposals/:id',
  allowedPermissions(['update:thesis_proposals', 'student:all', 'admin:all', 'moderator:all']),
  thesisController.updateThesisProposal
)

// ============= THESIS REGISTRATION ROUTES =============
router.get(
  '/registrations',
  allowedPermissions(['view:thesis_proposals', 'teacher:all', 'admin:all', 'moderator:all']),
  thesisController.getThesisRegistrations
);

router.get(
  '/registrations/teacher/me/:semesterId',
  allowedPermissions(['view:thesis_proposals', 'teacher:all']),
  thesisController.getMyThesisRegistrationsForTeacher
);

router.patch(
  '/registrations/:id/process',
  allowedPermissions(['approve:thesis_registrations', 'admin:all', 'moderator:all']),
  thesisController.processThesisRegistration
);

router.put(
  '/registrations/:id',
  allowedPermissions(['update:thesis_registrations', 'teacher:all', 'admin:all', 'moderator:all']),
  thesisController.updateThesisRegistration
);

// get report for a registration
// router.get(
//   '/registrations/:id/report',
//   allowedPermissions(['view:reports', 'admin:all', 'moderator:all']),
//   thesisController.generateThesisRegistrationReport
// );

// ============= THESIS ROUTES =============
router.get(
  '/student/me/:semesterId',
  allowedPermissions(['view:thesis_proposals', 'student:all']),
  thesisController.getThesisForStudentAndSemester
);
router.get(
  '/supervisor/me/:semesterId',
  allowedPermissions(['view:thesis_proposals', 'teacher:all']),
  thesisController.getThesesBySupervisor
);
router.get(
  '/assignment/me/:semesterId',
  allowedPermissions(['view:thesis_proposals', 'teacher:all']),
  thesisController.getThesesByAssignedTeacher
)
router.patch(
  '/:id/status',
  allowedPermissions(['update:thesis_proposals', 'teacher:all', 'admin:all', 'moderator:all']),
  thesisController.updateThesisStatus
);
router.get(
  '/semester/:semesterId',
  allowedPermissions(['view:thesis_proposals', 'student:all', 'teacher:all', 'admin:all', 'moderator:all']),
  thesisController.getThesesBySemester
);
router.get(
  '/:id',
  allowedPermissions(['admin:all', 'moderator:all', 'view:thesis_proposals', 'teacher:all', 'student:all']),
  thesisController.getThesis
);
router.get(
  '/',
  allowedPermissions(['view:thesis_proposals', 'teacher:all', 'admin:all', 'moderator:all']),
  thesisController.getTheses
);

// ============= THESIS ASSIGNMENT ROUTES =============
router.post(
  '/:thesisId/assignments',
  allowedPermissions(['assign:thesis_reviewers', 'assign:committees', 'admin:all', 'moderator:all']),
  thesisController.assignTeacherToThesis
);

router.delete(
  '/:thesisId/assignments',
  allowedPermissions(['assign:thesis_reviewers', 'assign:committees', 'admin:all', 'moderator:all']),
  thesisController.removeTeacherAssignment
);

// ============= DEFENSE SESSION ROUTES =============
router.post(
  '/defense-sessions',
  allowedPermissions(['schedule:defense_sessions', 'admin:all', 'moderator:all']),
  thesisController.scheduleDefenseSession
);

router.patch(
  '/defense-sessions/:id',
  allowedPermissions(['schedule:defense_sessions', 'admin:all', 'moderator:all']),
  thesisController.rescheduleDefenseSession
);

router.patch(
  '/defense-sessions/:id/complete',
  allowedPermissions(['schedule:defense_sessions', 'admin:all', 'moderator:all']),
  thesisController.completeDefenseSession
);

// ============= THESIS EVALUATION ROUTES =============
router.post(
  '/evaluations',
  allowedPermissions(['grade:thesis_supervisors', 'grade:thesis_reviews', 'grade:thesis_committees', 'teacher:all', 'admin:all']),
  thesisController.submitThesisEvaluation
);

// ============= REPORT ROUTES =============
// Report generation route
router.get(
  '/reports/:thesisId',
  allowedPermissions(['generate:reports', 'admin:all', 'moderator:all']),
  thesisController.generateThesisEvaluationReport
);

// ============= STATISTICS ROUTES =============
router.get(
  '/stats/outcomes',
  allowedPermissions(['view:thesis_proposals', 'teacher:all', 'moderator:all', 'admin:all']),
  thesisController.getThesisOutcomeStats
);

router.get(
  '/stats/grades',
  allowedPermissions(['view:thesis_proposals', 'teacher:all', 'moderator:all', 'admin:all']),
  thesisController.getThesisGradeDistribution
);

export default router;