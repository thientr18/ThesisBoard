import { Transaction } from 'sequelize';
import { sequelize } from '../models/db';
import { AppError } from '../utils/AppError';

// Import repositories
import { DefenseSessionRepository } from '../repositories/DefenseSessionRepository';
import { TeacherAvailabilityRepository } from '../repositories/TeacherAvailabilityRepository';
import { ThesisAssignmentRepository } from '../repositories/ThesisAssignmentRepository';
import { ThesisEvaluationRepository } from '../repositories/ThesisEvaluationRepository';
import { ThesisFinalGradeRepository } from '../repositories/ThesisFinalGradeRepository';
import { ThesisProposalRepository } from '../repositories/ThesisProposalRepository';
import { ThesisRegistrationRepository } from '../repositories/ThesisRegistrationRepository';
import { ThesisRepository } from '../repositories/ThesisRepository';

// Import models for type definitions
import { ThesisProposal } from '../models/ThesisProposal';
import { ThesisRegistration } from '../models/ThesisRegistration';
import { ThesisAssignment } from '../models/ThesisAssignment';
import { ThesisEvaluation } from '../models/ThesisEvaluation';
import { Thesis } from '../models/Thesis';
import { DefenseSession } from '../models/DefenseSession';

export class ThesisService {
  private defenseSessionRepository: DefenseSessionRepository;
  private teacherAvailabilityRepository: TeacherAvailabilityRepository;
  private thesisAssignmentRepository: ThesisAssignmentRepository;
  private thesisEvaluationRepository: ThesisEvaluationRepository;
  private thesisFinalGradeRepository: ThesisFinalGradeRepository;
  private thesisProposalRepository: ThesisProposalRepository;
  private thesisRegistrationRepository: ThesisRegistrationRepository;
  private thesisRepository: ThesisRepository;

  constructor() {
    this.defenseSessionRepository = new DefenseSessionRepository();
    this.teacherAvailabilityRepository = new TeacherAvailabilityRepository();
    this.thesisAssignmentRepository = new ThesisAssignmentRepository();
    this.thesisEvaluationRepository = new ThesisEvaluationRepository();
    this.thesisFinalGradeRepository = new ThesisFinalGradeRepository();
    this.thesisProposalRepository = new ThesisProposalRepository();
    this.thesisRegistrationRepository = new ThesisRegistrationRepository();
    this.thesisRepository = new ThesisRepository();
  }

  // ============= THESIS PROPOSAL METHODS =============

  /**
   * Create a new thesis proposal
   */
  async createThesisProposal(proposalData: {
    title: string;
    description: string;
    studentId: number;
    targetTeacherId: number;
    semesterId: number;
    keywords?: string[];
  }): Promise<ThesisProposal> {
    // Check if teacher has available capacity
    const availability = await this.teacherAvailabilityRepository.findByTeacherAndSemester(
      proposalData.targetTeacherId, 
      proposalData.semesterId
    );

    if (!availability || !availability.isOpen || availability.maxThesis <= 0) {
      throw new AppError(
        'Selected teacher is not available for thesis supervision this semester',
        400,
        'TEACHER_UNAVAILABLE'
      );
    }

    // Check if student already has an active proposal
    const activeProposal = await this.thesisProposalRepository.findActiveProposalForStudent(
      proposalData.studentId,
      proposalData.semesterId
    );

    if (activeProposal) {
      throw new AppError(
        'Student already has an active thesis proposal for this semester',
        400,
        'PROPOSAL_EXISTS'
      );
    }

    // Create the proposal
    return await this.thesisProposalRepository.create({
      title: proposalData.title,
      description: proposalData.description,
      status: 'submitted',
      studentId: proposalData.studentId,
      targetTeacherId: proposalData.targetTeacherId,
      semesterId: proposalData.semesterId,
      keywords: proposalData.keywords || [],
      submittedAt: new Date()
    } as any); // Using 'any' to bypass strict typing issues with optional fields
  }

  /**
   * Get thesis proposal by ID
   */
  async getThesisProposalById(id: number): Promise<ThesisProposal | null> {
    return await this.thesisProposalRepository.findById(id);
  }

  /**
   * Get thesis proposals for a student
   */
  async getThesisProposalsByStudent(studentId: number, semesterId?: number): Promise<ThesisProposal[]> {
    return await this.thesisProposalRepository.findByStudentId(studentId, semesterId);
  }

  /**
   * Get thesis proposals for a teacher
   */
  async getThesisProposalsForTeacher(teacherId: number, semesterId?: number): Promise<ThesisProposal[]> {
    return await this.thesisProposalRepository.findByTeacherId(teacherId, semesterId);
  }

  /**
   * Process a thesis proposal (accept or reject)
   */
  async processThesisProposal(
    proposalId: number, 
    decision: 'accept' | 'reject',
    userId: number,
    note?: string
  ): Promise<ThesisProposal | null> {
    const proposal = await this.thesisProposalRepository.findById(proposalId);
    
    if (!proposal) {
      throw new AppError('Thesis proposal not found', 404, 'PROPOSAL_NOT_FOUND');
    }

    if (proposal.status !== 'submitted') {
      throw new AppError(
        'Thesis proposal cannot be processed as it is not in submitted state',
        400,
        'INVALID_PROPOSAL_STATUS'
      );
    }

    const transaction = await sequelize.transaction();

    try {
      let processedProposal: ThesisProposal | null = null;

      if (decision === 'accept') {
        // Check teacher capacity
        const hasCapacity = await this.teacherAvailabilityRepository.decreaseThesisCapacity(
          proposal.targetTeacherId, 
          proposal.semesterId
        );

        if (!hasCapacity) {
          await transaction.rollback();
          throw new AppError(
            'Teacher no longer has capacity for new theses',
            400,
            'NO_CAPACITY'
          );
        }

        processedProposal = await this.thesisProposalRepository.acceptProposal(proposalId, note);
      } else {
        processedProposal = await this.thesisProposalRepository.rejectProposal(proposalId, note);
      }

      await transaction.commit();
      return processedProposal;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ============= THESIS REGISTRATION METHODS =============

  /**
   * Create a new thesis registration based on an approved proposal
   */
  async createThesisRegistration(data: {
    proposalId: number;
    studentId: number;
    supervisorTeacherId: number;
    semesterId: number;
    title: string;
    description: string;
    expectedResults?: string;
    submittedByUserId: number;
  }): Promise<ThesisRegistration> {
    // Check if student already has a registration for this semester
    const existingRegistrations = await this.thesisRegistrationRepository.findByStudentId(
      data.studentId, 
      data.semesterId
    );

    if (existingRegistrations.some(reg => 
        reg.status === 'pending_approval' || 
        reg.status === 'approved')) {
      throw new AppError(
        'Student already has an active thesis registration for this semester',
        400,
        'REGISTRATION_EXISTS'
      );
    }

    // Create the registration
    return await this.thesisRegistrationRepository.create({
      proposalId: data.proposalId,
      studentId: data.studentId,
      supervisorTeacherId: data.supervisorTeacherId,
      semesterId: data.semesterId,
      title: data.title,
      description: data.description,
      expectedResults: data.expectedResults || null,
      status: 'pending_approval',
      submittedByUserId: data.submittedByUserId,
      submittedAt: new Date()
    } as any);
  }

  /**
   * Process a thesis registration (approve or reject)
   */
  async processThesisRegistration(
    registrationId: number,
    decision: 'approve' | 'reject',
    userId: number,
    decisionReason?: string
  ): Promise<ThesisRegistration | null> {
    const registration = await this.thesisRegistrationRepository.findById(registrationId);
    
    if (!registration) {
      throw new AppError('Thesis registration not found', 404, 'REGISTRATION_NOT_FOUND');
    }

    if (registration.status !== 'pending_approval') {
      throw new AppError(
        'Thesis registration cannot be processed as it is not pending approval',
        400,
        'INVALID_REGISTRATION_STATUS'
      );
    }

    const transaction = await sequelize.transaction();

    try {
      let processedRegistration: ThesisRegistration | null = null;

      if (decision === 'approve') {
        processedRegistration = await this.thesisRegistrationRepository.approveRegistration(
          registrationId,
          userId,
          decisionReason,
          transaction
        );

        // Create actual thesis entry
        await this.thesisRepository.create({
          studentId: registration.studentId,
          title: registration.title,
          abstract: registration.abstract || null,
          supervisorTeacherId: registration.supervisorTeacherId,
          semesterId: registration.semesterId,
          status: 'registered',
          registrationId: registration.id
        } as any);

      } else {
        processedRegistration = await this.thesisRegistrationRepository.rejectRegistration(
          registrationId,
          userId,
          decisionReason,
          transaction
        );
      }

      await transaction.commit();
      return processedRegistration;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get thesis registrations by various filters
   */
  async getThesisRegistrations(filter: {
    studentId?: number;
    supervisorTeacherId?: number;
    semesterId?: number;
    status?: ThesisRegistration['status'];
  }): Promise<ThesisRegistration[]> {
    const whereClause: any = {};

    if (filter.studentId !== undefined) {
      return await this.thesisRegistrationRepository.findByStudentId(filter.studentId, filter.semesterId);
    } else if (filter.supervisorTeacherId !== undefined) {
      return await this.thesisRegistrationRepository.findBySupervisorId(filter.supervisorTeacherId, filter.semesterId);
    } else if (filter.semesterId !== undefined) {
      return await this.thesisRegistrationRepository.findBySemesterId(filter.semesterId);
    } else if (filter.status !== undefined) {
      return await this.thesisRegistrationRepository.findByStatus(filter.status, filter.semesterId);
    }

    return await this.thesisRegistrationRepository.findAll();
  }

  // ============= THESIS METHODS =============

  /**
   * Get thesis by ID
   */
  async getThesisById(id: number): Promise<Thesis | null> {
    return await this.thesisRepository.findById(id);
  }

  /**
   * Get theses by various filters
   */
  async getTheses(filter: {
    studentId?: number;
    supervisorTeacherId?: number;
    semesterId?: number;
    status?: Thesis['status'];
    titleContains?: string;
  }): Promise<Thesis[]> {
    return await this.thesisRepository.searchThesesByFilter(filter);
  }

  /**
   * Update thesis status
   */
  async updateThesisStatus(thesisId: number, status: Thesis['status']): Promise<Thesis | null> {
    return await this.thesisRepository.updateStatus(thesisId, status);
  }

  // ============= THESIS ASSIGNMENT METHODS =============

  /**
   * Assign a teacher to a thesis with a specific role
   */
  async assignTeacherToThesis(
    thesisId: number, 
    teacherId: number, 
    role: ThesisAssignment['role'],
    assignedByUserId: number
  ): Promise<ThesisAssignment> {
    const thesis = await this.thesisRepository.findById(thesisId);
    
    if (!thesis) {
      throw new AppError('Thesis not found', 404, 'THESIS_NOT_FOUND');
    }
    
    // Ensure teacher has availability for this semester
    const availability = await this.teacherAvailabilityRepository.findByTeacherAndSemester(
      teacherId, 
      thesis.semesterId
    );
    
    if (!availability || !availability.isOpen) {
      throw new AppError(
        'Teacher is not available for thesis assignments this semester',
        400,
        'TEACHER_UNAVAILABLE'
      );
    }
    
    return await this.thesisAssignmentRepository.assignTeacher(
      thesisId, 
      teacherId, 
      role, 
      assignedByUserId
    );
  }

  /**
   * Remove a teacher assignment from a thesis
   */
  async removeTeacherAssignment(
    thesisId: number, 
    teacherId: number, 
    role: ThesisAssignment['role']
  ): Promise<boolean> {
    return await this.thesisAssignmentRepository.removeAssignment(thesisId, teacherId, role);
  }

  /**
   * Get all assignments for a thesis
   */
  async getAssignmentsByThesis(thesisId: number): Promise<ThesisAssignment[]> {
    return await this.thesisAssignmentRepository.findByThesisId(thesisId);
  }

  /**
   * Get all theses assigned to a teacher
   */
  async getThesesByTeacher(teacherId: number, semesterId?: number): Promise<number[]> {
    return await this.thesisAssignmentRepository.findThesesByTeacherId(teacherId);
  }

  // ============= DEFENSE SESSION METHODS =============

  /**
   * Schedule a defense session for a thesis
   */
  async scheduleDefenseSession(data: {
    thesisId: number;
    scheduledAt: Date;
    room: string;
    notes?: string;
  }): Promise<DefenseSession> {
    const thesis = await this.thesisRepository.findById(data.thesisId);
    
    if (!thesis) {
      throw new AppError('Thesis not found', 404, 'THESIS_NOT_FOUND');
    }
    
    if (thesis.status !== 'in_progress') {
      throw new AppError(
        'Defense can only be scheduled for theses that are in progress',
        400,
        'INVALID_THESIS_STATUS'
      );
    }
    
    // Check if a defense session already exists
    const existingSession = await this.defenseSessionRepository.findByThesisId(data.thesisId);
    
    if (existingSession) {
      throw new AppError(
        'A defense session is already scheduled for this thesis',
        400,
        'SESSION_EXISTS'
      );
    }
    
    // Create defense session
    const session = await this.defenseSessionRepository.create({
      thesisId: data.thesisId,
      scheduledAt: data.scheduledAt,
      room: data.room,
      notes: data.notes || null,
      status: 'scheduled'
    } as any);
    
    // Update thesis status
    await this.thesisRepository.updateStatus(data.thesisId, 'defense_scheduled');
    
    return session;
  }

  /**
   * Reschedule a defense session
   */
  async rescheduleDefenseSession(
    sessionId: number, 
    scheduledAt: Date, 
    room?: string
  ): Promise<DefenseSession | null> {
    return await this.defenseSessionRepository.reschedule(sessionId, scheduledAt, room);
  }

  /**
   * Complete a defense session
   */
  async completeDefenseSession(sessionId: number): Promise<DefenseSession | null> {
    const session = await this.defenseSessionRepository.findById(sessionId);
    
    if (!session) {
      throw new AppError('Defense session not found', 404, 'SESSION_NOT_FOUND');
    }
    
    // Update session status
    const updatedSession = await this.defenseSessionRepository.updateStatus(sessionId, 'completed');
    
    if (updatedSession) {
      // Update thesis status
      await this.thesisRepository.updateStatus(session.thesisId, 'defense_completed');
    }
    
    return updatedSession;
  }

  /**
   * Get all upcoming defense sessions
   */
  async getUpcomingDefenseSessions(): Promise<DefenseSession[]> {
    return await this.defenseSessionRepository.findUpcoming();
  }

  // ============= THESIS EVALUATION METHODS =============

  /**
   * Submit a thesis evaluation
   */
  async submitThesisEvaluation(data: {
    thesisId: number;
    evaluatorTeacherId: number;
    role: ThesisEvaluation['role'];
    score: number;
    feedback?: string;
  }): Promise<ThesisEvaluation> {
    const thesis = await this.thesisRepository.findById(data.thesisId);
    
    if (!thesis) {
      throw new AppError('Thesis not found', 404, 'THESIS_NOT_FOUND');
    }
    
    if (thesis.status !== 'defense_completed') {
      throw new AppError(
        'Thesis can only be evaluated after defense completion',
        400,
        'INVALID_THESIS_STATUS'
      );
    }
    
    // Check if this teacher is assigned to evaluate this thesis
    const assignments = await this.thesisAssignmentRepository.findByThesisId(data.thesisId);
    const canEvaluate = assignments.some(
      assignment => assignment.teacherId === data.evaluatorTeacherId
    );
    
    if (!canEvaluate) {
      throw new AppError(
        'Teacher is not assigned to evaluate this thesis',
        403,
        'UNAUTHORIZED_EVALUATION'
      );
    }
    
    // Create evaluation
    const evaluation = await this.thesisEvaluationRepository.create({
      thesisId: data.thesisId,
      evaluatorTeacherId: data.evaluatorTeacherId,
      role: data.role,
      score: data.score,
      feedback: data.feedback || null,
      evaluatedAt: new Date()
    } as any);
    
    // Check if all required evaluations are complete
    this.checkAndFinalizeThesisGrade(data.thesisId);
    
    return evaluation;
  }

  /**
   * Get all evaluations for a thesis
   */
  async getEvaluationsByThesis(thesisId: number): Promise<ThesisEvaluation[]> {
    return await this.thesisEvaluationRepository.findByThesisId(thesisId);
  }

  // ============= THESIS FINAL GRADE METHODS =============

  /**
   * Check if all required evaluations are complete and compute final grade
   */
  async checkAndFinalizeThesisGrade(thesisId: number): Promise<void> {
    const thesis = await this.thesisRepository.findById(thesisId);
    if (!thesis || thesis.status !== 'defense_completed') return;
    
    // Get all assignments to determine required evaluators
    const assignments = await this.thesisAssignmentRepository.findByThesisId(thesisId);
    const requiredRoles = assignments.map(a => a.role as ThesisEvaluation['role']);
    
    // Check if all required evaluations are submitted
    const isFullyEvaluated = await this.thesisEvaluationRepository.isThesisFullyEvaluated(
      thesisId, 
      requiredRoles
    );
    
    if (isFullyEvaluated) {
      // Calculate average score
      const averageScore = await this.thesisEvaluationRepository.getAverageScoreByThesisId(thesisId);
      
      if (averageScore !== null) {
        // Create or update final grade
        await this.thesisFinalGradeRepository.createOrUpdate({
          thesisId,
          finalScore: averageScore
        });
        
        // Update thesis status
        await this.thesisRepository.updateStatus(thesisId, 'completed');
      }
    }
  }

  /**
   * Get final grade for a thesis
   */
  async getFinalGrade(thesisId: number): Promise<{ finalScore: number; evaluations: ThesisEvaluation[] } | null> {
    const finalGrade = await this.thesisFinalGradeRepository.findByThesisId(thesisId);
    
    if (!finalGrade) return null;
    
    const evaluations = await this.thesisEvaluationRepository.findByThesisId(thesisId);
    
    return {
      finalScore: finalGrade.finalScore,
      evaluations
    };
  }
}