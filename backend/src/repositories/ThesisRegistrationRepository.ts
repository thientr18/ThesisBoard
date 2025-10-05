import { Op, Transaction } from 'sequelize';
import { GenericRepository } from './GenericRepository';
import { ThesisRegistration } from '../models/ThesisRegistration';
import { AppError } from '../utils/AppError';

export class ThesisRegistrationRepository extends GenericRepository<ThesisRegistration, number> {
  constructor() {
    super(ThesisRegistration);
  }

  async findByStudentId(studentId: number, semesterId?: number): Promise<ThesisRegistration[]> {
    return this.model.findAll({
      where: { studentId, ...(semesterId && { semesterId }) }
    });
  }

  async findBySupervisorId(supervisorTeacherId: number, semesterId?: number): Promise<ThesisRegistration[]> {
    return this.model.findAll({
      where: { supervisorTeacherId, ...(semesterId && { semesterId }) }
    });
  }

  async findBySemesterId(semesterId: number): Promise<ThesisRegistration[]> {
    return this.model.findAll({
      where: { semesterId }
    });
  }

  async findByStatus(status: ThesisRegistration['status'], semesterId?: number): Promise<ThesisRegistration[]> {
    return this.model.findAll({
      where: { status, ...(semesterId && { semesterId }) }
    });
  }

  /**
   * Find registrations within a date range
   */
  async findByDateRange(startDate: Date, endDate: Date, semesterId?: number): Promise<ThesisRegistration[]> {
    return this.model.findAll({
      where: {
        submittedAt: {
          [Op.between]: [startDate, endDate]
        },
        ...(semesterId && { semesterId })
      }
    });
  }

  /**
   * Find pending registrations that require approval
   */
  async findPendingApproval(semesterId?: number): Promise<ThesisRegistration[]> {
    return this.model.findAll({
      where: {
        status: 'pending_approval',
        ...(semesterId && { semesterId })
      }
    });
  }

  /**
   * Find recently approved registrations
   */
  async findRecentlyApproved(days: number = 7): Promise<ThesisRegistration[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.model.findAll({
      where: {
        status: 'approved',
        decidedAt: {
          [Op.gte]: cutoffDate
        }
      }
    });
  }

  async approveRegistration(id: number, approvedByUserId: number, decisionReason?: string, transaction?: Transaction): Promise<ThesisRegistration | null> {
    const registration = await this.model.findByPk(id);
    if (!registration) {
      throw new Error('Thesis registration not found');
    }
    registration.status = 'approved';
    registration.approvedByUserId = approvedByUserId;
    registration.decisionReason = decisionReason || null;
    registration.decidedAt = new Date();
    await registration.save();
    return registration;
  }

  async rejectRegistration(id: number, rejectedByUserId: number, decisionReason?: string, transaction?: Transaction): Promise<ThesisRegistration | null> {
    const registration = await this.model.findByPk(id);
    if (!registration) {
      throw new AppError('Thesis registration not found');
    }
    registration.status = 'rejected';
    registration.approvedByUserId = rejectedByUserId;
    registration.decisionReason = decisionReason || null;
    registration.decidedAt = new Date();
    await registration.save();
    return registration;
  }

  async cancelRegistration(id: number, cancelledByUserId: number, decisionReason?: string, transaction?: Transaction): Promise<ThesisRegistration | null> {
    const registration = await this.model.findByPk(id);
    if (!registration) {
      throw new AppError('Thesis registration not found');
    }
    registration.status = 'cancelled';
    registration.approvedByUserId = cancelledByUserId;
    registration.decisionReason = decisionReason || null;
    registration.decidedAt = new Date();
    await registration.save();
    return registration;
  }
}