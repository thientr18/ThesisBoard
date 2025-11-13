import { Transaction } from 'sequelize';
import { sequelize } from '../models/db';
import { AppError } from '../utils/AppError';
import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';
import puppeteer from 'puppeteer';

// Import repositories
import { DefenseSessionRepository } from '../repositories/defense-session.repository';
import { TeacherAvailabilityRepository } from '../repositories/teacher-availability.repository';
import { ThesisAssignmentRepository } from '../repositories/thesis-assignment.repository';
import { ThesisEvaluationRepository } from '../repositories/thesis-evaluation.repository';
import { ThesisFinalGradeRepository } from '../repositories/thesis-final-grade.repository';
import { ThesisProposalRepository } from '../repositories/thesis-proposal.repository';
import { ThesisRegistrationRepository } from '../repositories/thesis-registration.repository';
import { ThesisRepository } from '../repositories/thesis.repository';

// Import notification service
import { NotificationService } from './notification.service';

// Import models for type definitions
import { ThesisProposal } from '../models/ThesisProposal';
import { ThesisRegistration } from '../models/ThesisRegistration';
import { ThesisAssignment } from '../models/ThesisAssignment';
import { ThesisEvaluation } from '../models/ThesisEvaluation';
import { Thesis } from '../models/Thesis';
import { DefenseSession } from '../models/DefenseSession';

import { ThesisRegistrationReportData } from '../types/report.types';
import { ThesisEvaluationReportData } from '../types/report.types';

export class ThesisService {
  private defenseSessionRepository: DefenseSessionRepository;
  private teacherAvailabilityRepository: TeacherAvailabilityRepository;
  private thesisAssignmentRepository: ThesisAssignmentRepository;
  private thesisEvaluationRepository: ThesisEvaluationRepository;
  private thesisFinalGradeRepository: ThesisFinalGradeRepository;
  private thesisProposalRepository: ThesisProposalRepository;
  private thesisRegistrationRepository: ThesisRegistrationRepository;
  private thesisRepository: ThesisRepository;
  private notificationService: NotificationService;

  constructor() {
    this.defenseSessionRepository = new DefenseSessionRepository();
    this.teacherAvailabilityRepository = new TeacherAvailabilityRepository();
    this.thesisAssignmentRepository = new ThesisAssignmentRepository();
    this.thesisEvaluationRepository = new ThesisEvaluationRepository();
    this.thesisFinalGradeRepository = new ThesisFinalGradeRepository();
    this.thesisProposalRepository = new ThesisProposalRepository();
    this.thesisRegistrationRepository = new ThesisRegistrationRepository();
    this.thesisRepository = new ThesisRepository();
    this.notificationService = new NotificationService();
  }

  // ============= THESIS PROPOSAL METHODS =============

  /**
   * Create a new thesis proposal
   */
  async createThesisProposal(proposalData: {
    title: string;
    abstract: string | null;
    studentId: number;
    targetTeacherId: number;
    semesterId: number;
    note: string | null;
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
    const proposal = await this.thesisProposalRepository.create({
      studentId: proposalData.studentId,
      targetTeacherId: proposalData.targetTeacherId,
      semesterId: proposalData.semesterId,
      title: proposalData.title,
      abstract: proposalData.abstract || null,
      status: 'submitted',
      note: proposalData.note || null,
    } as ThesisProposal); // Using 'any' to bypass strict typing issues with optional fields
    
    // Create notification for the teacher
    await this.notificationService.createNotification({
      userId: proposalData.targetTeacherId,
      type: 'THESIS_PROPOSAL',
      title: 'New Thesis Proposal',
      content: `A new thesis proposal "${proposalData.title}" has been submitted for your review.`,
      entityType: 'ThesisProposal',
      entityId: proposal.id
    });
    
    return proposal;
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
        
        // Create notification for the student
        await this.notificationService.createNotification({
          userId: proposal.studentId,
          type: 'THESIS_PROPOSAL_ACCEPTED',
          title: 'Thesis Proposal Accepted',
          content: `Your thesis proposal "${proposal.title}" has been accepted. You can now proceed with registration.`,
          entityType: 'ThesisProposal',
          entityId: proposal.id
        });
      } else {
        processedProposal = await this.thesisProposalRepository.rejectProposal(proposalId, note);
        
        // Create notification for the student
        await this.notificationService.createNotification({
          userId: proposal.studentId,
          type: 'THESIS_PROPOSAL_REJECTED',
          title: 'Thesis Proposal Rejected',
          content: `Your thesis proposal "${proposal.title}" has been rejected. ${note ? `Reason: ${note}` : ''}`,
          entityType: 'ThesisProposal',
          entityId: proposal.id
        });
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
    title: string | null;
    abstract: string | null;
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
    const registration = await this.thesisRegistrationRepository.create({
      studentId: data.studentId,
      supervisorTeacherId: data.supervisorTeacherId,
      semesterId: data.semesterId,
      title: data.title || null,
      abstract: data.abstract || null,
      status: 'pending_approval',
      submittedByTeacherId: data.submittedByUserId,
      decisionReason: data.expectedResults || null,
      approvedByUserId: null,
      decidedAt: null,
      submittedAt: new Date()
    } as ThesisRegistration);
    
    // Create notification for the supervisor
    await this.notificationService.createNotification({
      userId: data.supervisorTeacherId,
      type: 'THESIS_REGISTRATION',
      title: 'New Thesis Registration',
      content: `A new thesis registration "${data.title}" has been submitted for your approval.`,
      entityType: 'ThesisRegistration',
      entityId: registration.id
    });
    
    return registration;
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
        const thesis = await this.thesisRepository.create({
          studentId: registration.studentId,
          title: registration.title,
          abstract: registration.abstract || null,
          supervisorTeacherId: registration.supervisorTeacherId,
          semesterId: registration.semesterId,
          status: 'in_progress',
        } as Thesis);
        
        // Create notification for the student
        await this.notificationService.createNotification({
          userId: registration.studentId,
          type: 'THESIS_REGISTRATION_APPROVED',
          title: 'Thesis Registration Approved',
          content: `Your thesis registration "${registration.title}" has been approved. Your thesis is now officially registered.`,
          entityType: 'Thesis',
          entityId: thesis.id
        });

      } else {
        processedRegistration = await this.thesisRegistrationRepository.rejectRegistration(
          registrationId,
          userId,
          decisionReason,
          transaction
        );
        
        // Create notification for the student
        await this.notificationService.createNotification({
          userId: registration.studentId,
          type: 'THESIS_REGISTRATION_REJECTED',
          title: 'Thesis Registration Rejected',
          content: `Your thesis registration "${registration.title}" has been rejected. ${decisionReason ? `Reason: ${decisionReason}` : ''}`,
          entityType: 'ThesisRegistration',
          entityId: registration.id
        });
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
    const thesis = await this.thesisRepository.findById(thesisId);
    if (!thesis) {
      return null;
    }
    
    const updatedThesis = await this.thesisRepository.updateStatus(thesisId, status);
    
    if (updatedThesis) {
      // Create notifications for status changes
      const statusMessages = {
        registered: 'has been registered',
        in_progress: 'is now in progress',
        defense_scheduled: 'has been scheduled for defense',
        defense_completed: 'has completed the defense',
        completed: 'has been completed successfully',
        cancelled: 'has been cancelled'
      };
      
      const message = statusMessages[status] || 'status has been updated';
      
      // Notify student
      await this.notificationService.createNotification({
        userId: thesis.studentId,
        type: 'THESIS_STATUS_UPDATE',
        title: 'Thesis Status Updated',
        content: `Your thesis "${thesis.title}" ${message}.`,
        entityType: 'Thesis',
        entityId: thesis.id
      });
      
      // Notify supervisor
      if (thesis.supervisorTeacherId) {
        await this.notificationService.createNotification({
          userId: thesis.supervisorTeacherId,
          type: 'THESIS_STATUS_UPDATE',
          title: 'Thesis Status Updated',
          content: `Thesis "${thesis.title}" by your student ${message}.`,
          entityType: 'Thesis',
          entityId: thesis.id
        });
      }
    }
    
    return updatedThesis;
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
    
    const assignment = await this.thesisAssignmentRepository.assignTeacher(
      thesisId, 
      teacherId, 
      role, 
      assignedByUserId
    );
    
    // Create notification for the assigned teacher
    await this.notificationService.createNotification({
      userId: teacherId,
      type: 'THESIS_ASSIGNMENT',
      title: 'New Thesis Assignment',
      content: `You have been assigned as ${role} for the thesis "${thesis.title}".`,
      entityType: 'Thesis',
      entityId: thesisId
    });
    
    // Create notification for the student
    await this.notificationService.createNotification({
      userId: thesis.studentId,
      type: 'THESIS_ASSIGNMENT',
      title: 'Thesis Committee Update',
      content: `A teacher has been assigned as ${role} for your thesis.`,
      entityType: 'Thesis',
      entityId: thesisId
    });
    
    return assignment;
  }

  /**
   * Remove a teacher assignment from a thesis
   */
  async removeTeacherAssignment(
    thesisId: number, 
    teacherId: number, 
    role: ThesisAssignment['role']
  ): Promise<boolean> {
    const thesis = await this.thesisRepository.findById(thesisId);
    if (!thesis) {
      throw new AppError('Thesis not found', 404, 'THESIS_NOT_FOUND');
    }
    
    const removed = await this.thesisAssignmentRepository.removeAssignment(thesisId, teacherId, role);
    
    if (removed) {
      // Notify the teacher
      await this.notificationService.createNotification({
        userId: teacherId,
        type: 'THESIS_ASSIGNMENT_REMOVED',
        title: 'Thesis Assignment Removed',
        content: `Your assignment as ${role} for the thesis "${thesis.title}" has been removed.`,
        entityType: 'Thesis',
        entityId: thesisId
      });
    }
    
    return removed;
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
    } as DefenseSession);
    
    // Update thesis status
    await this.thesisRepository.updateStatus(data.thesisId, 'defense_scheduled');
    
    // Format the date for better readability
    const formattedDate = data.scheduledAt.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Notify student
    await this.notificationService.createNotification({
      userId: thesis.studentId,
      type: 'DEFENSE_SCHEDULED',
      title: 'Defense Session Scheduled',
      content: `Your thesis defense has been scheduled for ${formattedDate} in room ${data.room}.`,
      entityType: 'DefenseSession',
      entityId: session.id
    });
    
    // Notify supervisor
    if (thesis.supervisorTeacherId) {
      await this.notificationService.createNotification({
        userId: thesis.supervisorTeacherId,
        type: 'DEFENSE_SCHEDULED',
        title: 'Defense Session Scheduled',
        content: `Defense for thesis "${thesis.title}" has been scheduled for ${formattedDate} in room ${data.room}.`,
        entityType: 'DefenseSession',
        entityId: session.id
      });
    }
    
    // Notify committee members
    const assignments = await this.thesisAssignmentRepository.findByThesisId(data.thesisId);
    for (const assignment of assignments) {
      if (assignment.teacherId !== thesis.supervisorTeacherId) {
        await this.notificationService.createNotification({
          userId: assignment.teacherId,
          type: 'DEFENSE_SCHEDULED',
          title: 'Defense Session Scheduled',
          content: `Defense for thesis "${thesis.title}" has been scheduled for ${formattedDate} in room ${data.room}.`,
          entityType: 'DefenseSession',
          entityId: session.id
        });
      }
    }
    
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
    const session = await this.defenseSessionRepository.findById(sessionId);
    if (!session) {
      return null;
    }
    
    const thesis = await this.thesisRepository.findById(session.thesisId);
    if (!thesis) {
      return null;
    }
    
    const updatedSession = await this.defenseSessionRepository.reschedule(sessionId, scheduledAt, room);
    
    if (updatedSession) {
      // Format the date for better readability
      const formattedDate = scheduledAt.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const roomText = room ? ` in room ${room}` : '';
      
      // Notify student
      await this.notificationService.createNotification({
        userId: thesis.studentId,
        type: 'DEFENSE_RESCHEDULED',
        title: 'Defense Session Rescheduled',
        content: `Your thesis defense has been rescheduled for ${formattedDate}${roomText}.`,
        entityType: 'DefenseSession',
        entityId: sessionId
      });
      
      // Notify supervisor and committee members
      const assignments = await this.thesisAssignmentRepository.findByThesisId(thesis.id);
      const teacherIds = assignments.map(a => a.teacherId);
      if (thesis.supervisorTeacherId) {
        teacherIds.push(thesis.supervisorTeacherId);
      }
      
      // Remove duplicates
      const uniqueTeacherIds = [...new Set(teacherIds)];
      
      for (const teacherId of uniqueTeacherIds) {
        await this.notificationService.createNotification({
          userId: teacherId,
          type: 'DEFENSE_RESCHEDULED',
          title: 'Defense Session Rescheduled',
          content: `Defense for thesis "${thesis.title}" has been rescheduled for ${formattedDate}${roomText}.`,
          entityType: 'DefenseSession',
          entityId: sessionId
        });
      }
    }
    
    return updatedSession;
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
      
      const thesis = await this.thesisRepository.findById(session.thesisId);
      if (thesis) {
        // Notify student
        await this.notificationService.createNotification({
          userId: thesis.studentId,
          type: 'DEFENSE_COMPLETED',
          title: 'Defense Session Completed',
          content: `Your thesis defense has been marked as completed. Please wait for evaluations and final grading.`,
          entityType: 'DefenseSession',
          entityId: sessionId
        });
        
        // Notify committee members to submit evaluations
        const assignments = await this.thesisAssignmentRepository.findByThesisId(thesis.id);
        for (const assignment of assignments) {
          await this.notificationService.createNotification({
            userId: assignment.teacherId,
            type: 'EVALUATION_REQUIRED',
            title: 'Thesis Evaluation Required',
            content: `The defense for thesis "${thesis.title}" is now complete. Please submit your evaluation.`,
            entityType: 'Thesis',
            entityId: thesis.id
          });
        }
      }
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
    comments?: string;
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
      comments: data.comments || null,
    } as ThesisEvaluation);
    
    // Notify student that an evaluation has been submitted (without showing the score)
    await this.notificationService.createNotification({
      userId: thesis.studentId,
      type: 'EVALUATION_SUBMITTED',
      title: 'Thesis Evaluation Submitted',
      content: `An evaluation for your thesis has been submitted by a committee member.`,
      entityType: 'ThesisEvaluation',
      entityId: evaluation.id
    });
    
    // Check if all required evaluations are complete
    await this.checkAndFinalizeThesisGrade(data.thesisId);
    
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
        
        // Notify student about final grade
        await this.notificationService.createNotification({
          userId: thesis.studentId,
          type: 'THESIS_GRADED',
          title: 'Thesis Final Grade Available',
          content: `Your thesis "${thesis.title}" has been fully evaluated and graded. Final score: ${averageScore.toFixed(2)}.`,
          entityType: 'Thesis',
          entityId: thesisId
        });
        
        // Notify supervisor about final grade
        if (thesis.supervisorTeacherId) {
          await this.notificationService.createNotification({
            userId: thesis.supervisorTeacherId,
            type: 'THESIS_GRADED',
            title: 'Thesis Final Grade Computed',
            content: `Thesis "${thesis.title}" has been fully evaluated. Final score: ${averageScore.toFixed(2)}.`,
            entityType: 'Thesis',
            entityId: thesisId
          });
        }
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

  // ============= THESIS REPORT METHODS =============

  /**
 * Generate a thesis registration report as PDF
 * @param registrationId ID of the thesis registration
 * @param includeUniversityInfo Whether to include university info in the report
 */
  async generateThesisRegistrationReport(
    registrationId: number, 
    includeUniversityInfo: boolean = true
  ): Promise<Buffer> {
    // Get registration details
    const registration = await this.thesisRegistrationRepository.findById(registrationId);
    
    if (!registration) {
      throw new AppError('Thesis registration not found', 404, 'REGISTRATION_NOT_FOUND');
    }
    
    // Map the registration status to an allowed value for the report
    // This ensures compatibility with ThesisRegistrationReportData type
    const mappedStatus = registration.status === 'cancelled' 
      ? 'rejected' // Map 'cancelled' to 'rejected' for report purposes
      : registration.status as 'pending_approval' | 'approved' | 'rejected';
    
    // TODO: These would typically come from repositories or services
    // For this example, we're using mock data to demonstrate the report generation
    
    // Fetch related data from repositories (student, supervisor, etc.)
    // In a real implementation, you would use actual data from the database
    const mockReportData: ThesisRegistrationReportData = {
      university: {
        name: 'International University - HCMC',
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF30lEQVR4nO2dW4hVVRjHf6OVppmaNzQVLUzL0gzES2rphUqzQEqIHowouul7WdBTPUSUGmTRQx3ooYfAEsqH7k8JEYJJkQpeGi+ZmZYOpuY4/WEtOM7MOXvvs9ba37f3+sEHwzn77O9b//9ee+291tprQ6FQKBQKhUKhUCgUCoVC5jwpIu+LyG4ROSQifyf/7haRDSLyvIg8nmeiMdAjIptF5JaInBO5KSJbkn3eyzPxPHlBRA6IyG2RGyJSE5GLSQPcSP59Pdl+QEReyPOF5MV6ETkncktELonIwoT2moj8kNB+TWhzROSsiNwUkbUiUs7jxWTJ00nnfEtErqQaZImIXBeRX0SkL6WvT2g/J7Rpet5JGuk5EXkmi44mg/mrInI06ZxvisiKLqxgvYhcEJEfk9f1SJexMT7ubxGpJTRfJJ31vYjMzWoMO25j/zkrIoM9HNecFo76+sjjXEoGgd+Ac+m/wFnaSe8Z94jY6eB28qEcBz4DXgFmA33AVGAhsAZYB+wETgKjaed9SHt4MN0IQ8A24ClH5y0n5zsO/AG8A9zv6LyZsd/QGF8DD7iq0EJgL3DTcmxh4EuDI/gBeNhVRRYDXxoacQtYBZRcVcaCMrAa+NlQvw+AWa4q4pJ+YJuhcB8Br7mqRAbMBj42dOYngDmuKuGCF4F/DYXaAzzgqhIZMhv4zFDAc8ASV5XolZ3pvnr87xM8CZxKF2oPsMxVJXphCfCXoTDfAQ+5qoQHHgb2Gwp4HnjcVSV6YdBQgJvAclcF98wIcDrds/fIF4WbPh80DPiHgLmuCu6ZccABQ+GOA4+6KnivbDQU4Fq6lAqEUnKaMhVwvasCu8AwPR8HZrgqtGeeAQ4aCvgVMNlVoV1SSpp+LCncAf9VNofpjwA7gLGuCu2SlcCYoYCfAPe6KrQLpifNPFP1vyDh+bfARcMb4lYyLxOEecCVxnqZwp1OxsxC8ZahokcbRwkRWWOofDXx5ZohIisNdV8bW/PvYUM6dKL6sBJbJ/3Tpo3+kYisistTLaOd9JCILDTsl9ckETkoIrdF5B8RmRBr+M9oJ6lviIXmy6KI1EXkjohsiTX8bDvE7gbZJCJzReSoiNwVkd0iMi7WBnE9UNdJf0b7OoZgwjrDJ+0bC1vN6gZx/XTftpvF2V4bxOXKkcK2Bml3vM/1xwOFLQ3SaV3VdXVRE45N1o1OjdHqwLEQ2BJsaZBWx490qMAkETkhIiMisj2W8G9pg7RrjGbHj9xpHjNEpJKs5f29sPsSxWwQVw/P00XksIgMi8ja0MO/5Q3i4pNKs0TkqIgcLurHj3xrkG56+MzkOX1MX1C0Bul1OCMik0XkRxG5JCLPhhj+rjSI7ar7GREZEJHjyeB+c0jh72qD2ORQn1bXNWu2JfVzNvzzqUFsrqRZk6wK+TPh7yqMLmQyS5rPMz7mqYtcapBOvneJ8TMDKz030VNuNUgrBpLb1DdEZF5W4e96g7TzOmJLskD5v+QPqLPuwpj8bpB7/XO5q5XifcDpbK6Irwy7faV6N/AfYP8SVAW4aijQXuD+XM8ePiXgE0PhTgLzfRcwBB4BfjMUbhR43HcBQ2EZXS6Sty32AoZ3Iwtgk6FwFWCi7wKGQonuFq+lwv+2752Ih4Df030BeuAg/O9GFsTT2H9F6QYw3XcBQ2Im3a02vAos9l3AkBhK90xay18PLPJdwJDoA74wFO4fYKnvAobGakPhrqQD/wXACLDfUMADwFTfBQyJEvCuoXA1ijd9NrAIGDYUcBSY57uAoTEf+9s+1/guYGisw/7bomt9FzA0JtLlj8/+LzHfBQyNZdi/V8xxXcCQKWN/Q/q06wKGzljs70uc913A0HkJ+9Z6x3UBQ2esoXCXgQd9FzB03sC+teb7LmDolIFPDYX7DnjAdyFDZz72C+hrwBzfhQydFdh/E2m570KGTgn7RRVV3wWNgTL236etES/P9MR67Furx3cBY6AEfGko3AHi7PieWGn4ICJlrE+fTbh8tkpbaYrILhE5JCKXkt9M2SUii2JoqUKhUCgUCoVCoVAoFAp54T8LOzP9eeA9VAAAAABJRU5ErkJggg=='
      },
      document: {
        title: 'Thesis Registration Report',
        semester: 'Fall 2025',
        department: 'Computer Science',
        generatedAt: new Date()
      },
      student: {
        fullName: 'John Smith',
        id: 'ST12345',
        major: 'Computer Science',
        faculty: 'School of Engineering',
        gpa: 3.75,
        accumulatedCredits: 110
      },
      thesis: {
        title: registration.title || 'Untitled Thesis',
        type: 'Research',
        abstract: registration.abstract || 'No abstract provided',
        keywords: ['Machine Learning', 'Neural Networks', 'Computer Vision']
      },
      supervisor: {
        fullName: 'Dr. Jane Davis',
        academicTitle: 'Associate Professor',
        department: 'Computer Science',
        email: 'jane.davis@university.edu'
      },
      registration: {
        date: registration.submittedAt,
        status: mappedStatus, // Use the mapped status here
        notes: registration.decisionReason || ''
      },
      footer: {
        universityContactInfo: 'International University, Quarter 6, Linh Trung Ward, Thu Duc City, Ho Chi Minh City',
        websiteUrl: 'www.university.edu'
      }
    };

    // Render the EJS template with the data
    const templatePath = path.join(__dirname, '../views/thesis-registration-report.ejs');
    const html = await ejs.renderFile(templatePath, { data: mockReportData });

    // Launch Puppeteer and generate PDF
    // Fix the headless option to use boolean instead of string
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    });
    
    await browser.close();
    
    // Convert Uint8Array to Buffer before returning
    return Buffer.from(pdfData);
  }
  
  /**
   * Generate a thesis evaluation report as PDF
   * @param thesisId ID of the thesis
   * @param includeUniversityInfo Whether to include university info in the report
   */
  async generateThesisEvaluationReport(
    thesisId: number,
    includeUniversityInfo: boolean = true
  ): Promise<Buffer> {
    // Get thesis details
    const thesis = await this.thesisRepository.findById(thesisId);
    
    if (!thesis) {
      throw new AppError('Thesis not found', 404, 'THESIS_NOT_FOUND');
    }
    
    // Get evaluations
    const evaluations = await this.thesisEvaluationRepository.findByThesisId(thesisId);
    
    if (!evaluations || evaluations.length === 0) {
      throw new AppError('Thesis evaluations not found', 404, 'EVALUATIONS_NOT_FOUND');
    }
    
    // Get final grade
    const finalGrade = await this.thesisFinalGradeRepository.findByThesisId(thesisId);
    
    if (!finalGrade) {
      throw new AppError('Thesis final grade not found', 404, 'FINAL_GRADE_NOT_FOUND');
    }
    
    // Get defense session
    const defenseSession = await this.defenseSessionRepository.findByThesisId(thesisId);
    
    // Get committee assignments
    const assignments = await this.thesisAssignmentRepository.findByThesisId(thesisId);
    
    // TODO: In a real implementation, you would fetch the actual data from the database
    // For this example, we're using mock data to demonstrate the report generation
    
    // Convert numeric grade to letter grade
    const getLetterGrade = (score: number): string => {
      if (score >= 9.0) return 'A+';
      if (score >= 8.5) return 'A';
      if (score >= 8.0) return 'B+';
      if (score >= 7.0) return 'B';
      if (score >= 6.5) return 'C+';
      if (score >= 5.5) return 'C';
      if (score >= 5.0) return 'D';
      return 'F';
    };
    
    // Prepare the report data
    const reportData: ThesisEvaluationReportData = {
      university: {
        name: 'International University - HCMC',
        logo: 'data:image/png;base64,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',
        referenceNumber: `TE${thesisId}-${new Date().getFullYear()}`
      },
      document: {
        title: 'Thesis Evaluation Report',
        semester: 'Fall 2025',
        department: 'Computer Science',
        generatedAt: new Date()
      },
      student: {
        fullName: 'John Smith',
        id: 'ST12345',
        major: 'Computer Science',
        faculty: 'School of Engineering',
        gpa: 3.75,
        accumulatedCredits: 110
      },
      thesis: {
        title: thesis.title || 'Untitled Thesis',
        type: 'Research',
        abstract: thesis.abstract || 'No abstract provided',
        defenseDate: defenseSession ? defenseSession.scheduledAt : undefined
      },
      supervisor: {
        fullName: 'Dr. Jane Davis',
        academicTitle: 'Associate Professor',
        department: 'Computer Science',
        email: 'jane.davis@university.edu',
        comments: 'The student has shown excellent progress and dedication throughout the thesis work.',
        grade: 8.5
      },
      reviewer: {
        fullName: 'Dr. Michael Johnson',
        academicTitle: 'Professor',
        department: 'Computer Science',
        email: 'michael.johnson@university.edu',
        comments: 'The literature review is comprehensive, but the methodology could be improved.',
        grade: 7.8
      },
      committee: [
        {
          fullName: 'Dr. Sarah Wilson',
          role: 'Chair',
          department: 'Computer Science',
          grade: 8.7,
          comments: 'Excellent presentation and defense of research findings.'
        },
        {
          fullName: 'Dr. Robert Garcia',
          role: 'Member',
          department: 'Computer Science',
          grade: 8.2,
          comments: 'Good technical implementation but could use more testing.'
        },
        {
          fullName: 'Dr. Elizabeth Taylor',
          role: 'Member',
          department: 'Computer Science',
          grade: 8.5,
          comments: 'Strong conceptual framework and well-structured thesis.'
        }
      ],
      evaluation: {
        averageGrade: finalGrade.finalScore,
        letterGrade: getLetterGrade(finalGrade.finalScore),
        status: finalGrade.finalScore >= 5.0 ? 'Pass' : 'Fail',
        remarks: 'The student has successfully completed the thesis requirements.'
      },
      signatures: {
        supervisorName: 'Dr. Jane Davis',
        committeeName: 'Dr. Sarah Wilson',
        departmentHeadName: 'Prof. David Brown',
        date: new Date()
      },
      footer: {
        universityContactInfo: 'International University, Quarter 6, Linh Trung Ward, Thu Duc City, Ho Chi Minh City',
        websiteUrl: 'www.university.edu'
      }
    };

    // Render the EJS template with the data
    const templatePath = path.join(__dirname, '../views/thesis-report.ejs');
    const html = await ejs.renderFile(templatePath, { data: reportData });

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5cm',
        right: '0.5cm',
        bottom: '0.5cm',
        left: '0.5cm'
      }
    });
    
    await browser.close();
    
    // Convert Uint8Array to Buffer before returning
    return Buffer.from(pdfData);
  }
}