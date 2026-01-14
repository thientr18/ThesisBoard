import { Request, Response, NextFunction } from 'express';
import { ThesisService } from '../services/thesis.service';
import { UserService } from '../services/user.service';
import { SemesterService } from '../services/semester.service';
import { AppError } from '../utils/AppError';

export class ThesisController {
  private thesisService: ThesisService;
  private userService: UserService;
  private semesterService: SemesterService;
  constructor() {
    this.thesisService = new ThesisService();
    this.userService = new UserService();
    this.semesterService = new SemesterService();
  }

  // ============= THESIS PROPOSAL ENDPOINTS =============

  /**
   * Create a new thesis proposal
   */
  createThesisProposal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      const student = await this.userService.getStudentByUserId(Number(userId));
      if (!student) {
        throw new AppError('Student profile not found', 404, 'STUDENT_NOT_FOUND');
      }
      
      const { title, abstract, targetTeacherId, semesterId, note } = req.body;
      
      const proposal = await this.thesisService.createThesisProposal({
        title,
        abstract,
        studentId: student.id,
        targetTeacherId,
        semesterId,
        note,
      });
      
      return res.status(201).json({
        status: 'success',
        data: proposal
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get thesis proposal by ID
   */
  getThesisProposal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const proposal = await this.thesisService.getThesisProposalById(parseInt(id));
      
      if (!proposal) {
        throw new AppError('Thesis proposal not found', 404, 'PROPOSAL_NOT_FOUND');
      }
      
      return res.status(200).json({
        status: 'success',
        data: proposal
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Process a thesis proposal (accept/reject)
   */
  processThesisProposal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.user?.id);
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      
      const { id } = req.params;
      const { decision, note } = req.body;
      if (decision !== 'accepted' && decision !== 'rejected') {
        throw new AppError('Invalid decision', 400, 'INVALID_DECISION');
      }

      const initialProposal = await this.thesisService.getThesisProposalById(parseInt(id));
      const teacherId = await this.userService.getTeacherIdByUserId(userId);
      if (!teacherId || teacherId !== initialProposal?.targetTeacherId) {
        throw new AppError('Only the target teacher can accept or reject this proposal', 403, 'FORBIDDEN');
      }

      let registration = null;
      if (decision === 'accepted') {
        const proposalId = parseInt(id);
        const studentId = initialProposal?.studentId;
        const supervisorTeacherId = initialProposal?.targetTeacherId;
        const semesterId = initialProposal?.semesterId;
        const title = req.body.title || initialProposal?.title;
        const abstract = req.body.abstract || initialProposal?.abstract;
        const decisionReason = req.body.decisionReason || 'Accepted by target teacher';

        registration = await this.thesisService.createThesisRegistration({
          proposalId,
          studentId,
          supervisorTeacherId,
          semesterId,
          title,
          abstract,
          decisionReason,
          submittedByTeacherId: Number(teacherId)
        });
      }

      const proposal = await this.thesisService.processThesisProposal(
        parseInt(id),
        decision,
        Number(userId),
        note
      );
      
      return res.status(200).json({
        status: 'success',
        data: {
          proposal,
          registration
        }
      });
    } catch (error) {
      next(error);
    }
  };

  cancelThesisProposal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.user?.id);
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      const { id } = req.params;

      const initialProposal = await this.thesisService.getThesisProposalById(parseInt(id));
      const student = await this.userService.getStudentByUserId(Number(userId));
      if (!student || student.id !== initialProposal?.studentId) {
        throw new AppError('Only the proposing student can cancel this proposal', 403, 'FORBIDDEN');
      }

      const proposal = await this.thesisService.processThesisProposal(
        parseInt(id),
        'cancelled',
        Number(userId),
        'Cancelled by student'
      );
      return res.status(200).json({
        status: 'success',
        data: proposal
      });
    } catch (error) {
      next(error);
    }
  };

  getTeacherAvailable = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      const { semesterId } = req.params;
      const semester = await this.semesterService.getSemesterById(Number(semesterId));
      if (!semester) {
        throw new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND');
      }

      const teachers = await this.thesisService.getTeachersAvailabilityWithCapacity(Number(semesterId));

      return res.status(200).json({
        status: 'success',
        data: teachers
      });
    } catch (error) {
      next(error);
    }
  };

  getMyThesisProposalsForStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      const student = await this.userService.getStudentByUserId(Number(userId));
      if (!student) {
        throw new AppError('Student profile not found', 404, 'STUDENT_NOT_FOUND');
      }
      const semesterId = req.params.semesterId || req.query.semesterId;
      if (!semesterId) {
        throw new AppError('Semester ID is required', 400, 'SEMESTER_ID_REQUIRED');
      }
      
      const proposals = await this.thesisService.getThesisProposalsByStudent(
        student.id,
        parseInt(semesterId as string)
      );
      
      return res.status(200).json({
        status: 'success',
        data: proposals
      });
    } catch (error) {
      next(error);
    }
  };

  getMyThesisProposalsForTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      const teacherId = await this.userService.getTeacherIdByUserId(Number(userId));
      if (!teacherId) {
        throw new AppError('Teacher profile not found', 404, 'TEACHER_NOT_FOUND');
      }
      const semesterId = req.params.semesterId || req.query.semesterId;
      if (!semesterId) {
        throw new AppError('Semester ID is required', 400, 'SEMESTER_ID_REQUIRED');
      }
      
      const proposals = await this.thesisService.getThesisProposalsByTeacher(
        teacherId,
        parseInt(semesterId as string)
      );
      return res.status(200).json({
        status: 'success',
        data: proposals
      });
    } catch (error) {
      next(error);
    }
  };

  updateThesisProposal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      const { id } = req.params;

      const initialProposal = await this.thesisService.getThesisProposalById(parseInt(id));
      if (!initialProposal) {
        throw new AppError('Thesis proposal not found', 404, 'PROPOSAL_NOT_FOUND');
      }
      if (initialProposal.status !== 'submitted') {
        throw new AppError('Only pending proposals can be updated', 400, 'INVALID_PROPOSAL_STATUS');
      }
      const { title, abstract, note } = req.body;
      const proposal = await this.thesisService.updateThesisProposal(
        parseInt(id),
        { title, abstract, note },
        Number(userId)
      );
      return res.status(200).json({
        status: 'success',
        data: proposal
      });
    } catch (error) {
      next(error);
    }
  };

  // ============= THESIS REGISTRATION ENDPOINTS =============
  /**
   * Process a thesis registration (approve/reject)
   */
  processThesisRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      
      const { id } = req.params;
      const { decision, decisionReason } = req.body;
      if (decision !== 'approved' && decision !== 'rejected') {
        throw new AppError('Invalid decision', 400, 'INVALID_DECISION');
      }
      
      const registration = await this.thesisService.processThesisRegistration(
        parseInt(id),
        decision,
        Number(req.user.id),
        decisionReason
      );
      
      return res.status(200).json({
        status: 'success',
        data: registration
      });
    } catch (error) {
      next(error);
    }
  };

  updateThesisRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      const { id } = req.params;

      const { title, abstract, decisionReason } = req.body;

      const registration = await this.thesisService.updateThesisRegistration(
        parseInt(id),
        { title, abstract, decisionReason },
        Number(userId)
      );
      
      return res.status(200).json({
        status: 'success',
        data: registration
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get thesis registrations (filtered)
   */
  getThesisRegistrations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId, supervisorTeacherId, semesterId, status } = req.query;
      
      const filter: any = {};
      
      if (studentId) filter.studentId = parseInt(studentId as string);
      if (supervisorTeacherId) filter.supervisorTeacherId = parseInt(supervisorTeacherId as string);
      if (semesterId) filter.semesterId = parseInt(semesterId as string);
      if (status) filter.status = status;
      
      const registrations = await this.thesisService.getThesisRegistrations(filter);
      
      return res.status(200).json({
        status: 'success',
        data: registrations
      });
    } catch (error) {
      next(error);
    }
  };

  getMyThesisRegistrationsForTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      const teacherId = await this.userService.getTeacherIdByUserId(Number(userId));
      if (!teacherId) {
        throw new AppError('Teacher profile not found', 404, 'TEACHER_NOT_FOUND');
      }

      const { semesterId } = req.params;
      const semester = await this.semesterService.getSemesterById(Number(semesterId));
      if (!semester) {
        throw new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND');
      }
      const registrations = await this.thesisService.getThesisRegistrations(
        { supervisorTeacherId: teacherId, semesterId: Number(semesterId) }
      );

      return res.status(200).json({
        status: 'success',
        data: registrations
      });
    } catch (error) {
      next(error);
    }
  };

  // ============= THESIS ENDPOINTS =============

  getThesisForStudentAndSemester = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      const student = await this.userService.getStudentByUserId(Number(userId));
      if (!student) {
        throw new AppError('Student profile not found', 404, 'STUDENT_NOT_FOUND');
      }

      const { semesterId } = req.params;
      const semester = await this.semesterService.getSemesterById(Number(semesterId));
      if (!semester) {
        throw new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND');
      }

      const theses = await this.thesisService.getTheses({
        studentId: student.id,
        semesterId: Number(semesterId)
      });

      return res.status(200).json({
        status: 'success',
        data: theses
      });
    } catch (error) {
      next(error);
    }
  };

  getThesesBySupervisor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      const teacherId = await this.userService.getTeacherIdByUserId(Number(userId));
      if (!teacherId) {
        throw new AppError('Teacher profile not found', 404, 'TEACHER_NOT_FOUND');
      }

      const { semesterId } = req.params;
      const semester = await this.semesterService.getSemesterById(Number(semesterId));
      if (!semester) {
        throw new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND');
      }

      const theses = await this.thesisService.getTheses({
        supervisorTeacherId: teacherId,
        semesterId: Number(semesterId)
      });

      return res.status(200).json({
        status: 'success',
        data: theses
      });
    } catch (error) {
      next(error);
    }
  };

  getThesesByAssignedTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      const teacherId = await this.userService.getTeacherIdByUserId(Number(userId));
      if (!teacherId) {
        throw new AppError('Teacher profile not found', 404, 'TEACHER_NOT_FOUND');
      }

      const { semesterId } = req.params;
      const semester = await this.semesterService.getSemesterById(Number(semesterId));
      if (!semester) {
        throw new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND');
      }

      const theses = await this.thesisService.getThesesByAssignedTeacher(
        teacherId,
        Number(semesterId)
      );
      return res.status(200).json({
        status: 'success',
        data: theses
      });
    } catch (error) {
      next(error);
    }
  };

  getThesesBySemester = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { semesterId } = req.params;

      const theses = await this.thesisService.getTheses({
        semesterId: Number(semesterId)
      });

      return res.status(200).json({
        status: 'success',
        data: theses
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a thesis by ID
   */
  getThesis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      const { id } = req.params;
      const thesis = await this.thesisService.getThesisById(parseInt(id));
      if (!thesis) {
        throw new AppError('Thesis not found', 404, 'THESIS_NOT_FOUND');
      }

      const student = await this.userService.getStudentById(thesis.studentId);
      const supervisor = await this.userService.getTeacherById(thesis.supervisorTeacherId);
      const committeeAssignments = await this.thesisService.getAssignmentsByThesis(thesis.id);
      
      // Additional access checks
      let isAuthorized = false;
      if (student && student.userId === Number(userId)) {
        isAuthorized = true;
      }
      if (!isAuthorized) {
        if (supervisor && supervisor.userId === Number(userId)) {
          isAuthorized = true;
        }
      }
      if (!isAuthorized) {
        for (const assignment of committeeAssignments) {
          const teacher = await this.userService.getTeacherById(assignment.teacherId);
          if (teacher && teacher.userId === Number(userId)) {
            isAuthorized = true;
            break;
          }
        }
      }
      if (!isAuthorized) {
        throw new AppError('Access denied to this thesis', 403, 'FORBIDDEN');
      }

      const defenseSession = await this.thesisService.getDefenseSessionByThesisId(thesis.id);
      const evaluations = await this.thesisService.getEvaluationsByThesis(thesis.id);
      const finalGrade = await this.thesisService.getFinalGrade(thesis.id);

      return res.status(200).json({
        status: 'success',
        data: {
          thesis,
          student,
          supervisor,
          committeeAssignments,
          defenseSession,
          evaluations: evaluations || [],
          finalGrade: finalGrade || null
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all theses (with filters)
   */
  getTheses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId, supervisorTeacherId, semesterId, status, titleContains } = req.query;
      
      const filter: any = {};
      
      if (studentId) filter.studentId = parseInt(studentId as string);
      if (supervisorTeacherId) filter.supervisorTeacherId = parseInt(supervisorTeacherId as string);
      if (semesterId) filter.semesterId = parseInt(semesterId as string);
      if (status) filter.status = status;
      if (titleContains) filter.titleContains = titleContains as string;
      
      const theses = await this.thesisService.getTheses(filter);
      
      return res.status(200).json({
        status: 'success',
        data: theses
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update thesis status
   */
  updateThesisStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      
      const { id } = req.params;
      const { status } = req.body;
      
      const thesis = await this.thesisService.updateThesisStatus(parseInt(id), status);
      
      if (!thesis) {
        throw new AppError('Thesis not found', 404, 'THESIS_NOT_FOUND');
      }
      
      return res.status(200).json({
        status: 'success',
        data: thesis
      });
    } catch (error) {
      next(error);
    }
  };

  // ============= THESIS ASSIGNMENT ENDPOINTS =============

  /**
   * Assign a teacher to a thesis
   */
  assignTeacherToThesis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      
      const { thesisId } = req.params;
      const { teacherId, role } = req.body;
      
      const assignment = await this.thesisService.assignTeacherToThesis(
        parseInt(thesisId),
        teacherId,
        role,
        Number(userId)
      );
      
      return res.status(201).json({
        status: 'success',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove a teacher assignment
   */
  removeTeacherAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { thesisId } = req.params;
      const { teacherId, role } = req.body;
      
      const removed = await this.thesisService.removeTeacherAssignment(
        parseInt(thesisId),
        teacherId,
        role
      );
      
      if (!removed) {
        throw new AppError('Assignment not found', 404, 'ASSIGNMENT_NOT_FOUND');
      }
      
      return res.status(200).json({
        status: 'success',
        message: 'Assignment removed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get assignments for a thesis
   */
  getThesisAssignments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { thesisId } = req.params;
      
      const assignments = await this.thesisService.getAssignmentsByThesis(parseInt(thesisId));
      
      return res.status(200).json({
        status: 'success',
        data: assignments
      });
    } catch (error) {
      next(error);
    }
  };

  // ============= DEFENSE SESSION ENDPOINTS =============

  /**
   * Schedule a defense session
   */
  scheduleDefenseSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { thesisId, scheduledAt, room, notes } = req.body;
      
      // Validate scheduledAt
      if (!scheduledAt) {
        throw new AppError('Scheduled date and time is required', 400, 'MISSING_SCHEDULED_AT');
      }
      
      const scheduledDate = new Date(scheduledAt);
      
      // Check if the date is valid
      if (isNaN(scheduledDate.getTime())) {
        throw new AppError('Invalid date format', 400, 'INVALID_DATE_FORMAT');
      }
      
      // Check if the date is in the future
      if (scheduledDate < new Date()) {
        throw new AppError('Defense session must be scheduled in the future', 400, 'PAST_DATE');
      }
      
      const session = await this.thesisService.scheduleDefenseSession({
        thesisId,
        scheduledAt: scheduledDate,
        room,
        notes
      });
      
      return res.status(201).json({
        status: 'success',
        data: session
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reschedule a defense session
   */
  rescheduleDefenseSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { scheduledAt, room } = req.body;
      
      // Validate scheduledAt
      if (!scheduledAt) {
        throw new AppError('Scheduled date and time is required', 400, 'MISSING_SCHEDULED_AT');
      }
      
      const scheduledDate = new Date(scheduledAt);
      
      // Check if the date is valid
      if (isNaN(scheduledDate.getTime())) {
        throw new AppError('Invalid date format', 400, 'INVALID_DATE_FORMAT');
      }
      
      // Check if the date is in the future
      if (scheduledDate < new Date()) {
        throw new AppError('Defense session must be scheduled in the future', 400, 'PAST_DATE');
      }
      
      const session = await this.thesisService.rescheduleDefenseSession(
        parseInt(id),
        scheduledDate,
        room
      );
      
      if (!session) {
        throw new AppError('Defense session not found', 404, 'SESSION_NOT_FOUND');
      }
      
      return res.status(200).json({
        status: 'success',
        data: session
      });
    } catch (error) {
      next(error);
    }
  };
  /**
   * Complete a defense session
   */
  completeDefenseSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const session = await this.thesisService.completeDefenseSession(parseInt(id));
      
      if (!session) {
        throw new AppError('Defense session not found', 404, 'SESSION_NOT_FOUND');
      }
      
      return res.status(200).json({
        status: 'success',
        data: session
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get upcoming defense sessions
   */
  getUpcomingDefenseSessions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessions = await this.thesisService.getUpcomingDefenseSessions();
      
      return res.status(200).json({
        status: 'success',
        data: sessions
      });
    } catch (error) {
      next(error);
    }
  };

  // ============= THESIS EVALUATION ENDPOINTS =============

  /**
   * Submit a thesis evaluation
   */
  submitThesisEvaluation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      const teacherId = await this.userService.getTeacherIdByUserId(Number(userId));
      if (!teacherId) {
        throw new AppError('Teacher profile not found', 404, 'TEACHER_NOT_FOUND');
      }
      
      const { thesisId, role, score, comments } = req.body;

      const thesis = await this.thesisService.getThesisById(thesisId);
      if (!thesis) {
        throw new AppError('Thesis not found', 404, 'THESIS_NOT_FOUND');
      }
      
      const evaluation = await this.thesisService.submitThesisEvaluation({
        thesisId,
        evaluatorTeacherId: Number(teacherId),
        role,
        score,
        comments
      });
      
      return res.status(201).json({
        status: 'success',
        data: evaluation
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get evaluations for a thesis
   */
  getThesisEvaluations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { thesisId } = req.params;
      
      const evaluations = await this.thesisService.getEvaluationsByThesis(parseInt(thesisId));
      
      return res.status(200).json({
        status: 'success',
        data: evaluations
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get final grade for a thesis
   */
  getThesisFinalGrade = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { thesisId } = req.params;
      
      const finalGrade = await this.thesisService.getFinalGrade(parseInt(thesisId));
      
      if (!finalGrade) {
        throw new AppError('Final grade not found', 404, 'GRADE_NOT_FOUND');
      }
      
      return res.status(200).json({
        status: 'success',
        data: finalGrade
      });
    } catch (error) {
      next(error);
    }
  };

  // ============= THESIS REPORT ENDPOINTS =============

  /**
   * Generate and download a thesis evaluation report
   */
  generateThesisEvaluationReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { thesisId } = req.params;
      
      if (!thesisId || isNaN(parseInt(thesisId))) {
        throw new AppError('Valid thesis ID is required', 400, 'INVALID_THESIS_ID');
      }
      
      const pdfBuffer = await this.thesisService.generateThesisEvaluationReport(
        parseInt(thesisId)
      );
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=thesis-evaluation-report-${thesisId}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send the PDF as response
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };

  // Statistics
  getThesisOutcomeStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.thesisService.getOutcomeStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  getThesisGradeDistribution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.thesisService.getGradeDistribution();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };
}