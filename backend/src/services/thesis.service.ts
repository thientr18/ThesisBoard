import { Op, Transaction } from 'sequelize';
import { sequelize } from '../models/db';
import { AppError } from '../utils/AppError';
import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';
import puppeteer from 'puppeteer';

// Import repositories
import { StudentSemesterRepository } from '../repositories/student-semester.repository';
import { DefenseSessionRepository } from '../repositories/defense-session.repository';
import { TeacherAvailabilityRepository } from '../repositories/teacher-availability.repository';
import { ThesisAssignmentRepository } from '../repositories/thesis-assignment.repository';
import { ThesisEvaluationRepository } from '../repositories/thesis-evaluation.repository';
import { ThesisFinalGradeRepository } from '../repositories/thesis-final-grade.repository';
import { ThesisProposalRepository } from '../repositories/thesis-proposal.repository';
import { ThesisRegistrationRepository } from '../repositories/thesis-registration.repository';
import { ThesisRepository } from '../repositories/thesis.repository';
import { SemesterRepository } from '../repositories/semester.repository';
import { TeacherRepository } from '../repositories/teacher.repository';
import { StudentRepository } from '../repositories/student.repository';
import { UserRepository } from '../repositories/user.repository';

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
import { TeacherAvailability } from '../models/TeacherAvailability';
import { Semester } from '../models/Semester';

export class ThesisService {
  private studentSemesterRepository: StudentSemesterRepository = new StudentSemesterRepository();
  private defenseSessionRepository: DefenseSessionRepository;
  private teacherAvailabilityRepository: TeacherAvailabilityRepository;
  private thesisAssignmentRepository: ThesisAssignmentRepository;
  private thesisEvaluationRepository: ThesisEvaluationRepository;
  private thesisFinalGradeRepository: ThesisFinalGradeRepository;
  private thesisProposalRepository: ThesisProposalRepository;
  private thesisRegistrationRepository: ThesisRegistrationRepository;
  private thesisRepository: ThesisRepository;
  private teacherRepository: TeacherRepository;
  private semesterRepository: SemesterRepository;
  private studentRepository: StudentRepository;
  private userRepository: UserRepository;

  private notificationService: NotificationService;

  constructor() {
    this.studentSemesterRepository = new StudentSemesterRepository();
    this.defenseSessionRepository = new DefenseSessionRepository();
    this.teacherAvailabilityRepository = new TeacherAvailabilityRepository();
    this.thesisAssignmentRepository = new ThesisAssignmentRepository();
    this.thesisEvaluationRepository = new ThesisEvaluationRepository();
    this.thesisFinalGradeRepository = new ThesisFinalGradeRepository();
    this.thesisProposalRepository = new ThesisProposalRepository();
    this.thesisRegistrationRepository = new ThesisRegistrationRepository();
    this.thesisRepository = new ThesisRepository();
    this.teacherRepository = new TeacherRepository();
    this.semesterRepository = new SemesterRepository();
    this.studentRepository = new StudentRepository();
    this.userRepository = new UserRepository();
    
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
    // Check if semester is active
    const semester = await this.semesterRepository.findById(proposalData.semesterId);
    if (!semester || !semester.isActive) {
      throw new AppError(
        'You can only submit proposals for an active semester.',
        400,
        'SEMESTER_NOT_ACTIVE'
      );
    }

    // Check if teacher has available capacity
    const availability = await this.teacherAvailabilityRepository.getTeacherSemester(
      proposalData.targetTeacherId, 
      proposalData.semesterId
    );

    if (!availability || !availability.isOpen || availability.maxThesis < 1) {
      throw new AppError(
        'Selected teacher is not available for thesis supervision this semester',
        400,
        'TEACHER_UNAVAILABLE'
      );
    }

    const student = await this.studentSemesterRepository.getStudentSemester(
      proposalData.studentId,
      proposalData.semesterId
    );
    if (!student) {
      throw new AppError(
        'Student is not enrolled in the specified semester',
        400,
        'STUDENT_NOT_ENROLLED'
      );
    }
    if (student.type !== 'thesis') {
      throw new AppError(
        'Student is not registered for thesis work in the specified semester',
        400,
        'STUDENT_NOT_REGISTERED_FOR_THESIS'
      );
    }

    // Prevent multiple submitted proposals for same student-teacher-semester
    const existingSubmitted = await this.thesisProposalRepository.findByStudentTeacherSemester(
      proposalData.studentId,
      proposalData.targetTeacherId,
      proposalData.semesterId
    );
    if (existingSubmitted && existingSubmitted.status === 'submitted') {
      throw new AppError(
        'You already have a submitted proposal with this teacher for this semester.',
        400,
        'PROPOSAL_ALREADY_SUBMITTED'
      );
    }

    const thesisCount = await this.thesisRepository.count({
      supervisorTeacherId: proposalData.targetTeacherId,
      semesterId: proposalData.semesterId,
      status: { [Op.ne]: 'cancelled' }
    });

    const registrationCount = await this.thesisRegistrationRepository.count({
      supervisorTeacherId: proposalData.targetTeacherId,
      semesterId: proposalData.semesterId,
      status: { [Op.in]: ['pending_approval', 'approved'] }
    });

    const proposalCount = await this.thesisProposalRepository.count({
      targetTeacherId: proposalData.targetTeacherId,
      semesterId: proposalData.semesterId,
      status: { [Op.in]: ['accepted'] }
    });

    if (thesisCount >= availability.maxThesis || registrationCount >= availability.maxThesis || proposalCount >= availability.maxThesis) {
      throw new AppError(
        'Selected teacher has reached the maximum number of supervised theses for this semester',
        400,
        'TEACHER_CAPACITY_FULL'
      );
    }

    const activeRegistration = await this.thesisRegistrationRepository.findByStudentId(
      proposalData.studentId,
      proposalData.semesterId
    );

    if (activeRegistration && activeRegistration.length > 0) {
      throw new AppError(
        'Student already has an active thesis registration for this semester',
        400,
        'REGISTRATION_EXISTS'
      );
    }

    const activeThesis = await this.thesisRepository.findByStudentAndSemester(
      proposalData.studentId,
      proposalData.semesterId
    );
    if (activeThesis) {
      throw new AppError(
        'Student already has an active thesis for this semester',
        400,
        'THESIS_EXISTS'
      );
    }

    // Check if student already has an active proposal
    const activeProposals = await this.thesisProposalRepository.findActiveProposalForStudent(
      proposalData.studentId,
      proposalData.semesterId
    );

    if (activeProposals?.some(proposal => proposal.status === 'accepted')) {
      throw new AppError(
        'Student already has an accepted thesis proposal for this semester',
        400,
        'PROPOSAL_EXISTS'
      );
    }


    const teacher = await this.teacherRepository.findById(proposalData.targetTeacherId);
    const proposalWithTeacher = await this.thesisProposalRepository.findByStudentTeacherSemester(student.id, proposalData.targetTeacherId, proposalData.semesterId);

    if (proposalWithTeacher?.status === 'cancelled' || proposalWithTeacher?.status === 'rejected') {
      const updatedProposal = await this.thesisProposalRepository.update(proposalWithTeacher.id, {
        title: proposalData.title,
        abstract: proposalData.abstract,
        note: '',
        status: 'submitted',
        targetTeacherId: proposalData.targetTeacherId,
        decidedAt: null
      });

      if (!updatedProposal) {
        throw new AppError('Failed to update thesis proposal', 500, 'UPDATE_FAILED');
      }

      await this.notificationService.createNotification({
        userId: Number(teacher?.userId),
        type: 'THESIS_PROPOSAL',
        title: 'Thesis Proposal Resubmitted',
        content: `A thesis proposal "${proposalData.title}" has been resubmitted for your review.`,
      });

      return updatedProposal;
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
    } as ThesisProposal);
    
    // Create notification for the teacher
    await this.notificationService.createNotification({
      userId: Number(teacher?.userId),
      type: 'THESIS_PROPOSAL',
      title: 'New Thesis Proposal',
      content: `A new thesis proposal "${proposalData.title}" has been submitted for your review.`,
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
  async getThesisProposalsByTeacher(teacherId: number, semesterId?: number): Promise<ThesisProposal[]> {
    return await this.thesisProposalRepository.findByTeacherId(teacherId, semesterId);
  }
  

  async updateThesisProposal(
    proposalId: number,
    updateData: {
      title?: string;
      abstract?: string;
      note?: string;
    },
    userId: number
  ): Promise<ThesisProposal | null> {
    const proposal = await this.thesisProposalRepository.findById(proposalId);
    if (!proposal) {
      throw new AppError('Thesis proposal not found', 404, 'PROPOSAL_NOT_FOUND');
    }
    if (proposal.studentId !== userId) {
      throw new AppError('Unauthorized to update this proposal', 403, 'FORBIDDEN');
    }
    if (proposal.status !== 'submitted') {
      throw new AppError(
        'Only proposals in pending state can be updated',
        400,
        'INVALID_PROPOSAL_STATUS'
      );
    }
    const updatedProposal = await this.thesisProposalRepository.update(proposalId, updateData);
    return updatedProposal;
  }

  /**
   * Process a thesis proposal (accept or reject)
   */
  async processThesisProposal(
    proposalId: number, 
    decision: 'accepted' | 'rejected' | 'cancelled',
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
      const teacher = await this.teacherRepository.findById(proposal.targetTeacherId);
      const student = await this.studentRepository.findById(proposal.studentId);
      if (decision === 'accepted') {

        processedProposal = await this.thesisProposalRepository.acceptProposal(proposalId, note);
        
        // Create notification for the student
        await this.notificationService.createNotification({
          userId: Number(student?.userId),
          type: 'THESIS_PROPOSAL_ACCEPTED',
          title: 'Thesis Proposal Accepted',
          content: `Your thesis proposal "${proposal.title}" has been accepted. You can now proceed with registration.`,
        });
      } else if (decision === 'rejected') {
        processedProposal = await this.thesisProposalRepository.rejectProposal(proposalId, note);
        
        // Create notification for the student
        await this.notificationService.createNotification({
          userId: Number(student?.userId),
          type: 'THESIS_PROPOSAL_REJECTED',
          title: 'Thesis Proposal Rejected',
          content: `Your thesis proposal "${proposal.title}" has been rejected. ${note ? `Reason: ${note}` : ''}`,
        });
      } else if (decision === 'cancelled') {
        processedProposal = await this.thesisProposalRepository.cancelProposal(proposalId, note);

        // Create notification for the student
        await this.notificationService.createNotification({
          userId: Number(student?.userId),
          type: 'THESIS_PROPOSAL_CANCELLED',
          title: 'Thesis Proposal Cancelled',
          content: `Your thesis proposal "${proposal.title}" has been cancelled. ${note ? `Reason: ${note}` : ''}`,
        });
      }

      await transaction.commit();
      return processedProposal;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getTeachersAvailable(semesterId: number): Promise<TeacherAvailability[]> {
    return await this.teacherAvailabilityRepository.getTeachersInSemester(semesterId);
  }

  /**
   * Get teachers' availability with accepted proposals and remaining capacity
   */
  async getTeachersAvailabilityWithCapacity(semesterId: number) {
    const availabilities = await this.teacherAvailabilityRepository.getTeachersInSemester(semesterId);

    // For each teacher, count accepted proposals and calculate remaining capacity
    const results = await Promise.all(availabilities.map(async (availability) => {
      const acceptedCount = await this.thesisProposalRepository.countAcceptedProposals(
        availability.teacherId,
        semesterId
      );
      return {
        ...availability.toJSON(),
        acceptedProposals: acceptedCount,
        remainingCapacity: Math.max(0, availability.maxThesis - acceptedCount)
      };
    }));

    return results;
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
    decisionReason?: string;
    submittedByTeacherId: number;
  }): Promise<ThesisRegistration> {
    const transaction = await sequelize.transaction();
    try {
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
      const registration = await this.thesisRegistrationRepository.create(
        {
          studentId: data.studentId,
          supervisorTeacherId: data.supervisorTeacherId,
          semesterId: data.semesterId,
          title: data.title || null,
          abstract: data.abstract || null,
          status: 'pending_approval',
          decisionReason: data.decisionReason || null,
          approvedByUserId: null,
          decidedAt: null,
          submittedAt: new Date()
        } as ThesisRegistration,
          { transaction }
      );

      const otherProposals = await this.thesisProposalRepository.findByStudentId(data.studentId);

      for (const proposal of otherProposals) {
        if (proposal.id !== data.proposalId && proposal.status === 'submitted') {
          await this.thesisProposalRepository.cancelProposal(proposal.id, 'Cancelled due to thesis registration.', transaction);
        }
      }

      const teacher = await this.teacherRepository.findById(data.supervisorTeacherId);
      // Create notification for the supervisor
      await this.notificationService.createNotification({
        userId: Number(teacher?.userId),
        type: 'THESIS_REGISTRATION',
        title: 'New Thesis Registration',
        content: `A new thesis registration "${data.title}" has been submitted for your approval.`,
      });
      
      await transaction.commit();
      return registration;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateThesisRegistration(
    registrationId: number,
    updateData: {
      title?: string;
      abstract?: string;
      decisionReason?: string;
    },
    userId: number
  ): Promise<ThesisRegistration | null> {
    const registration = await this.thesisRegistrationRepository.findById(registrationId);
    if (!registration) {
      throw new AppError('Thesis registration not found', 404, 'REGISTRATION_NOT_FOUND');
    }

    const supervisor = await this.teacherRepository.findById(registration.supervisorTeacherId);
    if (supervisor?.userId !== userId) {
      throw new AppError('Unauthorized to update this registration', 403, 'FORBIDDEN');
    }

    if (registration.status !== 'pending_approval' && registration.status !== 'rejected') {
      throw new AppError(
        'Only registrations in pending approval or rejected state can be updated',
        400,
        'INVALID_REGISTRATION_STATUS'
      );
    }

    const updatedFields: any = { ...updateData, status: 'pending_approval' };

    const updatedRegistration = await this.thesisRegistrationRepository.update(registrationId, updatedFields);

    return updatedRegistration;
  }

  /**
   * Process a thesis registration (approve or reject)
   */
  async processThesisRegistration(
    registrationId: number,
    decision: 'approved' | 'rejected',
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
      const student = await this.studentRepository.findById(registration.studentId);
      const supervisor = await this.teacherRepository.findById(registration.supervisorTeacherId);
      
      if (decision === 'approved') {
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
          status: 'in_progress',
        } as Thesis);

        const otherRegistration = await this.thesisRegistrationRepository.findByStudentId(registration.studentId);
        for (const reg of otherRegistration) {
          if (reg.id !== registrationId && reg.status === 'pending_approval') {
            await this.thesisRegistrationRepository.cancelRegistration(reg.id, userId, 'Cancelled due to another registration approval', transaction);
          }
        }

        // Create notification for the student
        await this.notificationService.createNotification({
          userId: Number(student?.userId),
          type: 'THESIS_REGISTRATION_APPROVED',
          title: 'Thesis Registration Approved',
          content: `Your thesis registration "${registration.title}" has been approved. Your thesis is now officially registered.`,
        });

        await this.notificationService.createNotification({
          userId: Number(supervisor?.userId),
          type: 'THESIS_REGISTRATION_APPROVED',
          title: 'Thesis Registration Approved',
          content: `The thesis registration "${registration.title}" has been approved.`,
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
          userId: Number(student?.userId),
          type: 'THESIS_REGISTRATION_REJECTED',
          title: 'Thesis Registration Rejected',
          content: `Your thesis registration "${registration.title}" has been rejected. ${decisionReason ? `Reason: ${decisionReason}` : ''}`,
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
   * Get theses by various filters - Enhanced with defense eligibility
   */
  async getTheses(filter: {
    studentId?: number;
    supervisorTeacherId?: number;
    semesterId?: number;
    status?: Thesis['status'];
    titleContains?: string;
  }): Promise<any[]> {
    const theses = await this.thesisRepository.searchThesesByFilter(filter);

    const result = await Promise.all(theses.map(async (thesis) => {
      const student = await this.studentRepository.findById(thesis.studentId);
      const studentUser = student ? await this.userRepository.findById(student.userId) : null;

      const supervisor = await this.teacherRepository.findById(thesis.supervisorTeacherId);
      const supervisorUser = supervisor ? await this.userRepository.findById(supervisor.userId) : null;

      const committeeAssignmentsRaw = await this.thesisAssignmentRepository.findByThesisId(thesis.id);
      const committeeAssignments = await Promise.all(committeeAssignmentsRaw.map(async (assignment) => {
        const teacher = await this.teacherRepository.findById(assignment.teacherId);
        const teacherUser = teacher ? await this.userRepository.findById(teacher.userId) : null;
        return {
          ...assignment.toJSON(),
          teacher: {
            ...teacher?.toJSON(),
            user: teacherUser
          }
        };
      }));

      const teacherRole = filter.supervisorTeacherId && thesis.supervisorTeacherId === filter.supervisorTeacherId 
        ? 'supervisor' 
        : undefined;

      const defenseSession = await this.defenseSessionRepository.findByThesisId(thesis.id);
      const evaluations = await this.thesisEvaluationRepository.findByThesisId(thesis.id);
      const finalGrade = await this.thesisFinalGradeRepository.findByThesisId(thesis.id);

      // Check defense eligibility and committee assignment eligibility
      const defenseEligibility = await this.isEligibleForDefense(thesis.id);
      const committeeEligibility = await this.canAssignCommitteeMembers(thesis.id);

      return {
        thesis,
        student: { ...student?.toJSON(), user: studentUser },
        supervisor: { ...supervisor?.toJSON(), user: supervisorUser },
        committeeAssignments,
        defenseSession,
        evaluations,
        finalGrade,
        defenseEligibility,
        committeeEligibility,
        ...(teacherRole && { teacherRole })
      };
    }));

    return result;
  }

  async getThesesByAssignedTeacher(teacherId: number, semesterId?: number): Promise<any[]> {
    const thesisIds = await this.thesisAssignmentRepository.findThesesByTeacherId(teacherId);
    if (thesisIds.length === 0) {
      return [];
    }
    const theses = await this.thesisRepository.findByIdsAndSemester(thesisIds, semesterId);
    
    // Format the response to match the structure from getTheses
    const result = await Promise.all(theses.map(async (thesis) => {
      const student = await this.studentRepository.findById(thesis.studentId);
      const studentUser = student ? await this.userRepository.findById(student.userId) : null;

      const supervisor = await this.teacherRepository.findById(thesis.supervisorTeacherId);
      const supervisorUser = supervisor ? await this.userRepository.findById(supervisor.userId) : null;

      const committeeAssignmentsRaw = await this.thesisAssignmentRepository.findByThesisId(thesis.id);
      const committeeAssignments = await Promise.all(committeeAssignmentsRaw.map(async (assignment) => {
        const teacher = await this.teacherRepository.findById(assignment.teacherId);
        const teacherUser = teacher ? await this.userRepository.findById(teacher.userId) : null;
        return {
          ...assignment.toJSON(),
          teacher: {
            ...teacher?.toJSON(),
            user: teacherUser
          }
        };
      }));

      // Get the role for this teacher
      const teacherAssignment = committeeAssignmentsRaw.find(a => a.teacherId === teacherId);

      const defenseSession = await this.defenseSessionRepository.findByThesisId(thesis.id);
      const evaluations = await this.thesisEvaluationRepository.findByThesisId(thesis.id);
      const finalGrade = await this.thesisFinalGradeRepository.findByThesisId(thesis.id);

      return {
        thesis,
        student: { ...student?.toJSON(), user: studentUser },
        supervisor: { ...supervisor?.toJSON(), user: supervisorUser },
        committeeAssignments,
        defenseSession,
        evaluations,
        finalGrade,
        teacherRole: teacherAssignment?.role
      };
    }));

    return result;
  }

  /**
   * Update thesis status
   */
  async updateThesisStatus(thesisId: number, status: Thesis['status']): Promise<Thesis | null> {
    const thesis = await this.thesisRepository.findById(thesisId);
    if (!thesis) {
      return null;
    }
    
    const student = await this.studentRepository.findById(thesis.studentId);
    const supervisor = await this.teacherRepository.findById(thesis.supervisorTeacherId);
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
        userId: Number(student?.userId),
        type: 'THESIS_STATUS_UPDATE',
        title: 'Thesis Status Updated',
        content: `Your thesis "${thesis.title}" ${message}.`,
      });
      
      // Notify supervisor
      if (thesis.supervisorTeacherId) {
        await this.notificationService.createNotification({
          userId: Number(supervisor?.userId),
          type: 'THESIS_STATUS_UPDATE',
          title: 'Thesis Status Updated',
          content: `Thesis "${thesis.title}" by your student ${message}.`,
        });
      }
    }
    
    return updatedThesis;
  }

  // ============= THESIS ASSIGNMENT METHODS =============

  /**
   * Check if thesis is eligible for defense scheduling
   * Requirements:
   * 1. Must have supervisor evaluation
   * 2. Must have reviewer evaluation
   * 3. Average of supervisor + reviewer scores must be >= 50
   * 4. Must have at least one committee member assigned
   */
  async isEligibleForDefense(thesisId: number): Promise<{
    eligible: boolean;
    reason?: string;
    preDefenseScore?: number;
  }> {
    const thesis = await this.thesisRepository.findById(thesisId);
    
    if (!thesis) {
      return { eligible: false, reason: 'Thesis not found' };
    }

    if (thesis.status === 'cancelled') {
      return { eligible: false, reason: 'Thesis has been cancelled' };
    }

    if (thesis.status === 'completed') {
      return { eligible: false, reason: 'Thesis is already completed' };
    }

    // Check if supervisor and reviewer have evaluated
    const evaluations = await this.thesisEvaluationRepository.findByThesisId(thesisId);
    
    const supervisorEval = evaluations.find(e => e.role === 'supervisor');
    const reviewerEval = evaluations.find(e => e.role === 'reviewer');

    if (!supervisorEval) {
      return { eligible: false, reason: 'Supervisor evaluation is required' };
    }

    if (!reviewerEval) {
      return { eligible: false, reason: 'Reviewer evaluation is required' };
    }

    // Calculate pre-defense average score
    const preDefenseScore = (Number(supervisorEval.score) + Number(reviewerEval.score)) / 2;

    if (preDefenseScore < 50) {
      return { 
        eligible: false, 
        reason: `Pre-defense score (${preDefenseScore.toFixed(2)}) is below minimum requirement of 50`,
        preDefenseScore 
      };
    }

    // Check if at least one committee member is assigned
    const assignments = await this.thesisAssignmentRepository.findByThesisId(thesisId);
    const hasCommittee = assignments.some(a => a.role === 'committee_member');

    if (!hasCommittee) {
      return { 
        eligible: false, 
        reason: 'At least one committee member must be assigned before scheduling defense',
        preDefenseScore 
      };
    }

    return { eligible: true, preDefenseScore };
  }

  /**
   * Check if thesis can have committee members assigned
   * Requirements:
   * 1. Must have supervisor evaluation
   * 2. Must have reviewer evaluation  
   * 3. Average score must be >= 50
   */
  async canAssignCommitteeMembers(thesisId: number): Promise<{
    canAssign: boolean;
    reason?: string;
    preDefenseScore?: number;
  }> {
    const thesis = await this.thesisRepository.findById(thesisId);
    
    if (!thesis) {
      return { canAssign: false, reason: 'Thesis not found' };
    }

    if (thesis.status === 'cancelled' || thesis.status === 'completed') {
      return { canAssign: false, reason: `Thesis is ${thesis.status}` };
    }

    const evaluations = await this.thesisEvaluationRepository.findByThesisId(thesisId);
    
    const supervisorEval = evaluations.find(e => e.role === 'supervisor');
    const reviewerEval = evaluations.find(e => e.role === 'reviewer');

    if (!supervisorEval) {
      return { canAssign: false, reason: 'Waiting for supervisor evaluation' };
    }

    if (!reviewerEval) {
      return { canAssign: false, reason: 'Waiting for reviewer evaluation' };
    }

    const preDefenseScore = (Number(supervisorEval.score) + Number(reviewerEval.score)) / 2;

    if (preDefenseScore < 50) {
      return { 
        canAssign: false, 
        reason: `Pre-defense score (${preDefenseScore.toFixed(2)}) is below minimum requirement of 50. Cannot assign committee members.`,
        preDefenseScore 
      };
    }

    return { canAssign: true, preDefenseScore };
  }

  /**
   * Assign a teacher to a thesis with a specific role
   * Enhanced with committee member eligibility check
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

    // Check committee member assignment eligibility
    if (role === 'committee_member') {
      const eligibility = await this.canAssignCommitteeMembers(thesisId);
      
      if (!eligibility.canAssign) {
        throw new AppError(
          eligibility.reason || 'Cannot assign committee members at this time',
          400,
          'COMMITTEE_ASSIGNMENT_NOT_ALLOWED'
        );
      }
    }
    
    const assignment = await this.thesisAssignmentRepository.assignTeacher(
      thesisId, 
      teacherId, 
      role, 
      assignedByUserId
    );
    
    const teacher = await this.teacherRepository.findById(teacherId);
    const student = await this.studentRepository.findById(thesis.studentId);
    
    // Create notification for the assigned teacher
    await this.notificationService.createNotification({
      userId: Number(teacher?.userId),
      type: 'THESIS_ASSIGNMENT',
      title: 'New Thesis Assignment',
      content: `You have been assigned as ${role} for the thesis "${thesis.title}".`,
    });
    
    // Create notification for the student
    await this.notificationService.createNotification({
      userId: Number(student?.userId),
      type: 'THESIS_ASSIGNMENT',
      title: 'Thesis Committee Update',
      content: `A teacher has been assigned as ${role} for your thesis.`,
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
    const teacher = await this.teacherRepository.findById(teacherId);

    const thesis = await this.thesisRepository.findById(thesisId);
    if (!thesis) {
      throw new AppError('Thesis not found', 404, 'THESIS_NOT_FOUND');
    }
    
    // Check if teacher has already submitted an evaluation
    const existingEvaluation = await this.thesisEvaluationRepository.findByThesisIdAndTeacher(
      thesisId,
      teacherId,
      role === 'reviewer' ? 'reviewer' : 'committee_member'
    );
    
    if (existingEvaluation) {
      throw new AppError(
        'Cannot remove teacher assignment. This teacher has already submitted an evaluation for this thesis.',
        400,
        'TEACHER_HAS_EVALUATED'
      );
    }
    
    const removed = await this.thesisAssignmentRepository.removeAssignment(thesisId, teacherId, role);
    
    if (removed) {
      // Notify the teacher
      await this.notificationService.createNotification({
        userId: Number(teacher?.userId),
        type: 'THESIS_ASSIGNMENT_REMOVED',
        title: 'Thesis Assignment Removed',
        content: `Your assignment as ${role} for the thesis "${thesis.title}" has been removed.`,
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

  async getDefenseSessionByThesisId(thesisId: number): Promise<DefenseSession | null> {
    return await this.defenseSessionRepository.findByThesisId(thesisId);
  }

  /**
   * Schedule a defense session for a thesis
   * Enhanced with eligibility check
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

    // Check defense eligibility
    const eligibility = await this.isEligibleForDefense(data.thesisId);
    
    if (!eligibility.eligible) {
      throw new AppError(
        eligibility.reason || 'Thesis is not eligible for defense scheduling',
        400,
        'DEFENSE_NOT_ELIGIBLE'
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
    
    const student = await this.studentRepository.findById(thesis.studentId);
    const supervisor = await this.teacherRepository.findById(thesis.supervisorTeacherId);
    
    // Notify student
    await this.notificationService.createNotification({
      userId: Number(student?.userId),
      type: 'DEFENSE_SCHEDULED',
      title: 'Defense Session Scheduled',
      content: `Your thesis defense has been scheduled for ${formattedDate} in room ${data.room}. Pre-defense score: ${eligibility.preDefenseScore?.toFixed(2)}`
    });
    
    // Notify supervisor
    if (thesis.supervisorTeacherId) {
      await this.notificationService.createNotification({
        userId: Number(supervisor?.userId),
        type: 'DEFENSE_SCHEDULED',
        title: 'Defense Session Scheduled',
        content: `Defense for thesis "${thesis.title}" has been scheduled for ${formattedDate} in room ${data.room}.`
      });
    }
    
    // Notify committee members
    const assignments = await this.thesisAssignmentRepository.findByThesisId(data.thesisId);
    for (const assignment of assignments) {
      if (assignment.teacherId !== thesis.supervisorTeacherId) {
        const teacher = await this.teacherRepository.findById(assignment.teacherId);
        await this.notificationService.createNotification({
          userId: Number(teacher?.userId),
          type: 'DEFENSE_SCHEDULED',
          title: 'Defense Session Scheduled',
          content: `Defense for thesis "${thesis.title}" has been scheduled for ${formattedDate} in room ${data.room}.`
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

    const student = await this.studentRepository.findById(thesis.studentId);
    
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
        userId: Number(student?.userId),
        type: 'DEFENSE_RESCHEDULED',
        title: 'Defense Session Rescheduled',
        content: `Your thesis defense has been rescheduled for ${formattedDate}${roomText}.`
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
        const teacher = await this.teacherRepository.findById(teacherId);
        await this.notificationService.createNotification({
          userId: Number(teacher?.userId),
          type: 'DEFENSE_RESCHEDULED',
          title: 'Defense Session Rescheduled',
          content: `Defense for thesis "${thesis.title}" has been rescheduled for ${formattedDate}${roomText}.`
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
    const student = await this.studentRepository.findById((await this.thesisRepository.findById(session.thesisId))?.studentId || 0);

    if (updatedSession) {
      // Update thesis status
      await this.thesisRepository.updateStatus(session.thesisId, 'defense_completed');
      
      const thesis = await this.thesisRepository.findById(session.thesisId);
      if (thesis) {
        // Notify student
        await this.notificationService.createNotification({
          userId: Number(student?.userId),
          type: 'DEFENSE_COMPLETED',
          title: 'Defense Session Completed',
          content: `Your thesis defense has been marked as completed. Please wait for evaluations and final grading.`
        });
        
        // Notify committee members to submit evaluations
        const assignments = await this.thesisAssignmentRepository.findByThesisId(thesis.id);
        for (const assignment of assignments) {
          const teacher = await this.teacherRepository.findById(assignment.teacherId);
          await this.notificationService.createNotification({
            userId: Number(teacher?.userId),
            type: 'EVALUATION_REQUIRED',
            title: 'Thesis Evaluation Required',
            content: `The defense for thesis "${thesis.title}" is now complete. Please submit your evaluation.`
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

  async getThesisEvaluationById(id: number): Promise<ThesisEvaluation | null> {
    return await this.thesisEvaluationRepository.findById(id);
  }

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
    
    // Once thesis is completed (report generated), no more evaluations allowed
    if (thesis.status === 'completed') {
      throw new AppError(
        'Cannot evaluate a completed thesis. The final report has already been generated.',
        400,
        'THESIS_ALREADY_COMPLETED'
      );
    }
    
    // Validation based on role:
    // - Supervisor and Reviewer can grade when status is 'in_progress' or later (but not 'completed')
    // - Committee members can only grade after 'defense_completed' (but not 'completed')
    if (data.role === 'committee_member') {
      if (thesis.status !== 'defense_completed') {
        throw new AppError(
          'Committee members can only evaluate after defense completion',
          400,
          'INVALID_THESIS_STATUS'
        );
      }
    } else if (data.role === 'supervisor' || data.role === 'reviewer') {
      if (thesis.status !== 'in_progress' && 
          thesis.status !== 'defense_scheduled' && 
          thesis.status !== 'defense_completed') {
        throw new AppError(
          'Supervisor and Reviewer can only evaluate after thesis is in progress',
          400,
          'INVALID_THESIS_STATUS'
        );
      }
    }
    
    // Check if this teacher is authorized to evaluate
    const isSupervisor = thesis.supervisorTeacherId === data.evaluatorTeacherId && data.role === 'supervisor';
    const assignments = await this.thesisAssignmentRepository.findByThesisId(data.thesisId);
    const isAssigned = assignments.some(
      assignment => assignment.teacherId === data.evaluatorTeacherId && 
                    ((assignment.role === 'reviewer' && data.role === 'reviewer') ||
                     (assignment.role === 'committee_member' && data.role === 'committee_member'))
    );
    
    if (!isSupervisor && !isAssigned) {
      throw new AppError(
        'Teacher is not assigned to evaluate this thesis',
        403,
        'UNAUTHORIZED_EVALUATION'
      );
    }
    
    const existingEvaluation = await this.thesisEvaluationRepository.findByThesisIdAndTeacher(
      data.thesisId,
      data.evaluatorTeacherId,
      data.role
    );

    let evaluation: ThesisEvaluation;
    const student = await this.studentRepository.findById(thesis.studentId);

    if (existingEvaluation) {
      existingEvaluation.score = data.score;
      existingEvaluation.comments = data.comments || null;
      evaluation = await existingEvaluation.save();

      // Notify student that an evaluation has been updated (without showing the score)
      await this.notificationService.createNotification({
        userId: Number(student?.userId),
        type: 'EVALUATION_UPDATED',
        title: 'Thesis Evaluation Updated',
        content: `An evaluation for your thesis has been updated.`
      });
    } else {
      evaluation = await this.thesisEvaluationRepository.create({
        thesisId: data.thesisId,
        evaluatorTeacherId: data.evaluatorTeacherId,
        role: data.role,
        score: data.score,
        comments: data.comments || null,
      } as ThesisEvaluation);

      // Notify student that an evaluation has been submitted (without showing the score)
      await this.notificationService.createNotification({
        userId: Number(student?.userId),
        type: 'EVALUATION_SUBMITTED',
        title: 'Thesis Evaluation Submitted',
        content: `An evaluation for your thesis has been submitted.`
      });
    }

    // Check if supervisor and reviewer have both graded
    await this.checkPreDefenseEligibility(data.thesisId);
    
    // Check if all evaluations are complete and update final grade
    await this.checkAndFinalizeThesisGrade(data.thesisId);
    
    return evaluation;
  }

  /**
   * Check if supervisor and reviewer have both evaluated, and determine defense eligibility
   */
  async checkPreDefenseEligibility(thesisId: number): Promise<void> {
    const thesis = await this.thesisRepository.findById(thesisId);
    if (!thesis || thesis.status !== 'in_progress') {
      return;
    }

    const evaluations = await this.thesisEvaluationRepository.findByThesisId(thesisId);
    
    const supervisorEval = evaluations.find(e => e.role === 'supervisor');
    const reviewerEval = evaluations.find(e => e.role === 'reviewer');

    // Both supervisor and reviewer must have graded
    if (!supervisorEval || !reviewerEval) {
      console.log(`Pre-defense eligibility check: Missing evaluations for thesis ${thesisId}`);
      return;
    }

    // Calculate average of supervisor and reviewer scores
    const avgScore = (Number(supervisorEval.score) + Number(reviewerEval.score)) / 2;
    console.log(`Pre-defense average score for thesis ${thesisId}: ${avgScore}`);

    const student = await this.studentRepository.findById(thesis.studentId);
    const supervisor = await this.teacherRepository.findById(thesis.supervisorTeacherId);

    if (avgScore < 50) {
      // Failed - cannot proceed to defense
      await this.thesisRepository.updateStatus(thesisId, 'cancelled');
      
      // Notify student
      await this.notificationService.createNotification({
        userId: Number(student?.userId),
        type: 'THESIS_FAILED',
        title: 'Thesis Pre-Defense Evaluation Failed',
        content: `Your thesis has not met the minimum requirements for defense. Average score: ${avgScore.toFixed(2)}. Please contact your supervisor.`
      });

      // Notify supervisor
      if (supervisor) {
        await this.notificationService.createNotification({
          userId: Number(supervisor.userId),
          type: 'THESIS_FAILED',
          title: 'Thesis Pre-Defense Failed',
          content: `Thesis "${thesis.title}" did not meet minimum requirements. Average score: ${avgScore.toFixed(2)}.`
        });
      }

      console.log(`Thesis ${thesisId} marked as cancelled due to low pre-defense score: ${avgScore}`);
    } else {
      // Passed - eligible for defense
      console.log(`Thesis ${thesisId} eligible for defense with score: ${avgScore}`);
      
      // Notify student of eligibility
      await this.notificationService.createNotification({
        userId: Number(student?.userId),
        type: 'DEFENSE_ELIGIBLE',
        title: 'Thesis Eligible for Defense',
        content: `Your thesis has passed the pre-defense evaluation with an average score of ${avgScore.toFixed(2)}. Your defense session can now be scheduled.`
      });
    }
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
  async isFullyEvaluated(thesisId: number): Promise<boolean> {
    const thesis = await this.thesisRepository.findById(thesisId);
    if (!thesis) {
      return false;
    }

    const assignments = await this.thesisAssignmentRepository.findByThesisId(thesisId);
    const evaluations = await this.thesisEvaluationRepository.findByThesisId(thesisId);

    // Build list of required evaluators
    const requiredEvaluators: { teacherId: number, role: ThesisEvaluation['role'] }[] = [];
    
    // Supervisor is required
    if (thesis.supervisorTeacherId) {
      requiredEvaluators.push({ teacherId: thesis.supervisorTeacherId, role: 'supervisor' });
    }
    
    // Add assigned reviewers and committee members
    for (const assignment of assignments) {
      if (assignment.role === 'reviewer') {
        requiredEvaluators.push({ teacherId: assignment.teacherId, role: 'reviewer' });
      } else if (assignment.role === 'committee_member') {
        requiredEvaluators.push({ teacherId: assignment.teacherId, role: 'committee_member' });
      }
    }
    // Check if every required evaluator has submitted an evaluation
    const allEvaluated = requiredEvaluators.every(req =>
      evaluations.some(ev =>
        ev.evaluatorTeacherId === req.teacherId && ev.role === req.role
      )
    );

    const result = allEvaluated && requiredEvaluators.length > 0;
    
    return result;
  }

  /**
   * Check if all required evaluations are complete and compute final grade
   * Note: This does NOT mark the thesis as completed - that happens when report is exported
   */
  async checkAndFinalizeThesisGrade(thesisId: number): Promise<void> {
    const thesis = await this.thesisRepository.findById(thesisId);
    if (!thesis) {
      return;
    }
    
    // Check if all required evaluations are submitted
    const isFullyEvaluated = await this.isFullyEvaluated(thesisId);
    
    if (!isFullyEvaluated) {
      return;
    }
    
    // Calculate average score
    const averageScore = await this.thesisEvaluationRepository.getAverageScoreByThesisId(thesisId);
    
    if (averageScore === null) {
      return;
    }
    
    // Check if final grade already exists
    const existingFinalGrade = await this.thesisFinalGradeRepository.findByThesisId(thesisId);
    
    // Create or update final grade
    await this.thesisFinalGradeRepository.createOrUpdate({
      thesisId,
      finalScore: averageScore
    });
    
    console.log(`Final grade ${existingFinalGrade ? 'updated' : 'created'} for thesis ${thesisId}: ${averageScore}`);
    
    // Send notifications about grade changes (but DON'T mark as completed)
    if (!existingFinalGrade || existingFinalGrade.finalScore !== averageScore) {
      const student = await this.studentRepository.findById(thesis.studentId);
      
      // Notify student about final grade
      await this.notificationService.createNotification({
        userId: Number(student?.userId),
        type: 'THESIS_GRADED',
        title: existingFinalGrade ? 'Thesis Final Grade Updated' : 'Thesis Final Grade Available',
        content: `Your thesis "${thesis.title}" has been ${existingFinalGrade ? 're-evaluated and the' : 'fully evaluated and'} final score is: ${averageScore.toFixed(2)}.`,
      });
      
      // Notify supervisor about final grade
      if (thesis.supervisorTeacherId) {
        const supervisor = await this.teacherRepository.findById(thesis.supervisorTeacherId);
        await this.notificationService.createNotification({
          userId: Number(supervisor?.userId),
          type: 'THESIS_GRADED',
          title: existingFinalGrade ? 'Thesis Final Grade Updated' : 'Thesis Final Grade Computed',
          content: `Thesis "${thesis.title}" has been ${existingFinalGrade ? 're-evaluated. New' : 'fully evaluated.'} Final score: ${averageScore.toFixed(2)}.`,
        });
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
   * Generate a thesis evaluation report as PDF
   * This also marks the thesis as completed (admin/moderator action)
   */
  async generateThesisEvaluationReport(
    thesisId: number
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
    
    // Get student data
    const student = await this.studentRepository.findById(thesis.studentId);
    const studentUser = student ? await this.userRepository.findById(student.userId) : null;
    
    // Get supervisor data
    const supervisor = await this.teacherRepository.findById(thesis.supervisorTeacherId);
    const supervisorUser = supervisor ? await this.userRepository.findById(supervisor.userId) : null;
    const supervisorEval = evaluations.find(e => e.role === 'supervisor');
    
    // Get reviewer data
    const reviewerEval = evaluations.find(e => e.role === 'reviewer');
    let reviewer = null;
    let reviewerUser = null;
    if (reviewerEval) {
      reviewer = await this.teacherRepository.findById(reviewerEval.evaluatorTeacherId);
      reviewerUser = reviewer ? await this.userRepository.findById(reviewer.userId) : null;
    }
    
    // Get committee members data
    const committeeEvals = evaluations.filter(e => e.role === 'committee_member');
    const committeeMembers = await Promise.all(
      committeeEvals.map(async (evaluation) => {
        const teacher = await this.teacherRepository.findById(evaluation.evaluatorTeacherId);
        const teacherUser = teacher ? await this.userRepository.findById(teacher.userId) : null;
        return {
          fullName: teacherUser?.fullName || 'Unknown',
          academicTitle: teacher?.title || '',
          grade: Number(evaluation.score),
          comments: evaluation.comments || ''
        };
      })
    );
    
    // Get defense session
    const defenseSession = await this.defenseSessionRepository.findByThesisId(thesisId);
    
    // Get semester
    const semester = await this.semesterRepository.findById(thesis.semesterId);
    
    const getLetterGrade = (score: number): string => {
      if (score >= 90.0) return 'A+';
      if (score >= 85.0) return 'A';
      if (score >= 80.0) return 'B+';
      if (score >= 70.0) return 'B';
      if (score >= 65.0) return 'C+';
      if (score >= 55.0) return 'C';
      if (score >= 50.0) return 'D';
      return 'F';
    };
    
    const reportData: ThesisEvaluationReportData = {
      student: {
        name: studentUser?.fullName || 'Unknown Student',
        id: student?.studentIdCode || 'N/A',
        phone: student?.phone || '',
        className: student?.className || '',
        thesisTitle: thesis.title || 'Untitled Thesis'
      },
      supervisor: {
        name: supervisorUser?.fullName || 'Unknown Supervisor',
        academicTitle: supervisor?.title || '',
        grade: supervisorEval ? Number(supervisorEval.score) : 0,
        comments: supervisorEval?.comments || ''
      },
      reviewer: reviewerEval ? {
        name: reviewerUser?.fullName || 'Unknown Reviewer',
        academicTitle: reviewer?.title || '',
        grade: Number(reviewerEval.score),
        comments: reviewerEval.comments || ''
      } : undefined,
      committee: committeeMembers,
      evaluation: {
        averageGrade: Number(finalGrade.finalScore),
        letterGrade: getLetterGrade(Number(finalGrade.finalScore)),
        status: Number(finalGrade.finalScore) >= 50 ? 'Pass' : 'Fail',
        defenseDate: defenseSession?.scheduledAt
      },
      departmentHead: {
        name: 'Dr. Nguyen Van A',
        title: 'Head of Computer Science Department'
      },
      semester: semester?.name || '',
      date: new Date(),
      universityInfo: {
        name: "International University - Vietnam National University HCM City",
        address: "Quarter 6, Linh Trung Ward, Thu Duc City, Ho Chi Minh City, Vietnam",
        contact: "info@hcmiu.edu.vn | (028) 37244270"
      }
    };

    // Mark thesis as completed when report is generated
    if (thesis.status !== 'completed') {
      await this.thesisRepository.updateStatus(thesisId, 'completed');
      console.log(`Thesis ${thesisId} marked as completed upon report generation`);
      
      // Notify student that thesis is officially completed
      await this.notificationService.createNotification({
        userId: Number(student?.userId),
        type: 'THESIS_COMPLETED',
        title: 'Thesis Officially Completed',
        content: `Your thesis "${thesis.title}" has been officially completed and the final report has been generated.`,
      });
    }

    const templatePath = path.join(__dirname, '../views/thesis-report.ejs');
    const html = await ejs.renderFile(templatePath, { 
      data: reportData,
      formatDate: (date: Date) => {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    });

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
    
    return Buffer.from(pdfData);
  }

  // Statistics
  async getOutcomeStats() {
    // Get 4 most recent semesters
    const semesters = await this.semesterRepository.findAll({}, 0, 4, [['startDate', 'DESC']]);
    const semesterIds = semesters.map(s => s.id);

    const theses = await this.thesisRepository.findAll(
      {
        semesterId: { [Op.in]: semesterIds }
      },
      0,
      undefined,
      undefined,
      {
        include: [
          {
            model: Semester,
            as: 'semester',
            attributes: ['id', 'name', 'startDate']
          }
        ]
      }
    );

    // Group by semester
    const semesterMap = new Map<number, {
      semesterName: string;
      startDate: Date;
      completed: number;
      in_progress: number;
      cancelled: number;
      defense_scheduled: number;
      defense_completed: number;
    }>();

    theses.forEach((thesis: any) => {
      const semesterId = thesis.semesterId;
      const semesterName = thesis.semester?.name || `Semester ${semesterId}`;
      const startDate = thesis.semester?.startDate || new Date();

      if (!semesterMap.has(semesterId)) {
        semesterMap.set(semesterId, {
          semesterName,
          startDate,
          completed: 0,
          in_progress: 0,
          cancelled: 0,
          defense_scheduled: 0,
          defense_completed: 0
        });
      }

      const stats = semesterMap.get(semesterId)!;

      switch (thesis.status) {
        case 'completed':
          stats.completed++;
          break;
        case 'in_progress':
          stats.in_progress++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
        case 'defense_scheduled':
          stats.defense_scheduled++;
          break;
        case 'defense_completed':
          stats.defense_completed++;
          break;
      }
    });

    // Convert map to array and sort by start date (oldest to newest)
    return Array.from(semesterMap.values())
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .map(({ semesterName, completed, in_progress, cancelled, defense_scheduled, defense_completed }) => ({
        semester: semesterName,
        completed,
        in_progress,
        cancelled,
        defense_scheduled,
        defense_completed
      }));
  }

  async getGradeDistribution() {
    // Get 4 most recent semesters
    const semesters = await this.semesterRepository.findAll({}, 0, 4, [['startDate', 'DESC']]);
    const semesterIds = semesters.map(s => s.id);

    const finalGrades = await this.thesisFinalGradeRepository.findAll(
      {},
      0,
      undefined,
      undefined,
      {
        include: [
          {
            model: Thesis,
            as: 'thesis',
            where: {
              semesterId: { [Op.in]: semesterIds }
            },
            include: [
              {
                model: Semester,
                as: 'semester',
                attributes: ['id', 'name', 'startDate']
              }
            ]
          }
        ]
      }
    );

    // Group by semester
    const semesterMap = new Map<number, {
      semesterName: string;
      startDate: Date;
      excellent: number;
      good: number;
      average: number;
      fail: number;
    }>();

    finalGrades.forEach((grade: any) => {
      const thesis = grade.thesis;
      if (!thesis || !thesis.semester) return;

      const semesterId = thesis.semesterId;
      const semesterName = thesis.semester.name || `Semester ${semesterId}`;
      const startDate = thesis.semester.startDate || new Date();
      const score = Number(grade.finalScore);

      if (!semesterMap.has(semesterId)) {
        semesterMap.set(semesterId, {
          semesterName,
          startDate,
          excellent: 0,
          good: 0,
          average: 0,
          fail: 0
        });
      }

      const stats = semesterMap.get(semesterId)!;

      if (score >= 8.5) {
        stats.excellent++;
      } else if (score >= 7.0) {
        stats.good++;
      } else if (score >= 5.0) {
        stats.average++;
      } else {
        stats.fail++;
      }
    });

    // Convert map to array and sort by start date (oldest to newest)
    return Array.from(semesterMap.values())
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .map(({ semesterName, excellent, good, average, fail }) => ({
        semester: semesterName,
        excellent,
        good,
        average,
        fail
      }));
  }
}