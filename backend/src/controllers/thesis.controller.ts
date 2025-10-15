import { Request, Response, NextFunction } from 'express';
import { ThesisService } from '../services/thesis.service';
import { AppError } from '../utils/AppError';

export class ThesisController {
  private thesisService: ThesisService;

  constructor() {
    this.thesisService = new ThesisService();
  }

  // ============= THESIS PROPOSAL ENDPOINTS =============

  /**
   * Create a new thesis proposal
   */
  createThesisProposal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      
      const { title, abstract, targetTeacherId, semesterId, note } = req.body;
      
      const proposal = await this.thesisService.createThesisProposal({
        title,
        abstract,
        studentId: req.user.id,
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
   * Get thesis proposals for current user (student or teacher)
   */
  getMyThesisProposals = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      
      const { semesterId } = req.query;
      const userId = req.user.id;
      const roles = req.user.roles || [];
      
      let proposals;
      
      if (roles.includes('student')) {
        proposals = await this.thesisService.getThesisProposalsByStudent(
          userId, 
          semesterId ? parseInt(semesterId as string) : undefined
        );
      } else if (roles.includes('teacher')) {
        proposals = await this.thesisService.getThesisProposalsForTeacher(
          userId,
          semesterId ? parseInt(semesterId as string) : undefined
        );
      } else {
        throw new AppError('User role not authorized', 403, 'FORBIDDEN');
      }
      
      return res.status(200).json({
        status: 'success',
        data: proposals
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
      if (!req.user) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      
      const { id } = req.params;
      const { decision, note } = req.body;
      
      if (decision !== 'accept' && decision !== 'reject') {
        throw new AppError('Invalid decision', 400, 'INVALID_DECISION');
      }
      
      const proposal = await this.thesisService.processThesisProposal(
        parseInt(id),
        decision,
        req.user.id,
        note
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
   * Create a thesis registration
   */
  createThesisRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      
      const { 
        proposalId,
        studentId,
        supervisorTeacherId,
        semesterId,
        title,
        abstract,
        expectedResults
      } = req.body;
      
      const registration = await this.thesisService.createThesisRegistration({
        proposalId,
        studentId,
        supervisorTeacherId,
        semesterId,
        title,
        abstract,
        expectedResults,
        submittedByUserId: req.user.id
      });
      
      return res.status(201).json({
        status: 'success',
        data: registration
      });
    } catch (error) {
      next(error);
    }
  };

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
      
      if (decision !== 'approve' && decision !== 'reject') {
        throw new AppError('Invalid decision', 400, 'INVALID_DECISION');
      }
      
      const registration = await this.thesisService.processThesisRegistration(
        parseInt(id),
        decision,
        req.user.id,
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

  // ============= THESIS ENDPOINTS =============

  /**
   * Get a thesis by ID
   */
  getThesis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const thesis = await this.thesisService.getThesisById(parseInt(id));
      
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
   * Get my theses as a student or supervisor
   */
  getMyTheses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      
      const { semesterId } = req.query;
      const userId = req.user.id;
      const roles = req.user.roles || [];
      
      let theses;
      
      if (roles.includes('student')) {
        theses = await this.thesisService.getTheses({
          studentId: userId,
          semesterId: semesterId ? parseInt(semesterId as string) : undefined
        });
      } else if (roles.includes('teacher')) {
        theses = await this.thesisService.getTheses({
          supervisorTeacherId: userId,
          semesterId: semesterId ? parseInt(semesterId as string) : undefined
        });
      } else {
        throw new AppError('User role not authorized', 403, 'FORBIDDEN');
      }
      
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
      if (!req.user) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      
      const { thesisId } = req.params;
      const { teacherId, role } = req.body;
      
      const assignment = await this.thesisService.assignTeacherToThesis(
        parseInt(thesisId),
        teacherId,
        role,
        req.user.id
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
      
      const session = await this.thesisService.scheduleDefenseSession({
        thesisId,
        scheduledAt: new Date(scheduledAt),
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
      
      const session = await this.thesisService.rescheduleDefenseSession(
        parseInt(id),
        new Date(scheduledAt),
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
      if (!req.user) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }
      
      const { thesisId, role, score, comments } = req.body;

      const evaluation = await this.thesisService.submitThesisEvaluation({
        thesisId,
        evaluatorTeacherId: req.user.id,
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
   * Generate and download a thesis registration report
   */
  generateThesisRegistrationReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { registrationId } = req.params;
      const { includeUniversityInfo } = req.query;
      
      if (!registrationId || isNaN(parseInt(registrationId))) {
        throw new AppError('Valid registration ID is required', 400, 'INVALID_REGISTRATION_ID');
      }
      
      const pdfBuffer = await this.thesisService.generateThesisRegistrationReport(
        parseInt(registrationId),
        includeUniversityInfo === 'true'
      );
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=thesis-registration-${registrationId}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send the PDF as response
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate and download a thesis evaluation report
   */
  generateThesisEvaluationReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { thesisId } = req.params;
      const { includeUniversityInfo } = req.query;
      
      if (!thesisId || isNaN(parseInt(thesisId))) {
        throw new AppError('Valid thesis ID is required', 400, 'INVALID_THESIS_ID');
      }
      
      const pdfBuffer = await this.thesisService.generateThesisEvaluationReport(
        parseInt(thesisId),
        includeUniversityInfo === 'true'
      );
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=thesis-evaluation-${thesisId}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send the PDF as response
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };
}