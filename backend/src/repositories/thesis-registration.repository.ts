import { Op, Transaction } from 'sequelize';
import { GenericRepository } from './generic.repository';
import { ThesisRegistration } from '../models/ThesisRegistration';
import { AppError } from '../utils/AppError';
import { Student } from '../models/Student';
import { Teacher } from '../models/Teacher';
import { User } from '../models/User';
export class ThesisRegistrationRepository extends GenericRepository<ThesisRegistration, number> {
  constructor() {
    super(ThesisRegistration);
  }

  async count(options?: object): Promise<number> {
    return this.model.count({
      where: { ...options }
    });
  }

  async findByStudentId(studentId: number, semesterId?: number): Promise<ThesisRegistration[]> {
    return this.model.findAll({
      where: { studentId, ...(semesterId && { semesterId }) },
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user' }] },
        { model: Teacher, as: 'supervisorTeacher', include: [{ model: User, as: 'user' }] }
      ]
    });
  }

  async findBySupervisorId(supervisorTeacherId: number, semesterId?: number): Promise<ThesisRegistration[]> {
    return this.model.findAll({
      where: { supervisorTeacherId, ...(semesterId && { semesterId }) },
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user' }] },
        { model: Teacher, as: 'supervisorTeacher', include: [{ model: User, as: 'user' }] }
      ]
    });
  }

  async findBySemesterId(semesterId: number): Promise<ThesisRegistration[]> {
    return this.model.findAll({
      where: { semesterId },
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user' }] },
        { model: Teacher, as: 'supervisorTeacher', include: [{ model: User, as: 'user' }] }
      ]
    });
  }

  async findByStatus(status: ThesisRegistration['status'], semesterId?: number): Promise<ThesisRegistration[]> {
    return this.model.findAll({
      where: { status, ...(semesterId && { semesterId }) },
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user' }] },
        { model: Teacher, as: 'supervisorTeacher', include: [{ model: User, as: 'user' }] }
      ]
    });
  }

  findAll(filters?: any, offset?: number, limit?: number, order?: Array<[string, string]>): Promise<ThesisRegistration[]> {
    const whereClause: any = { ...filters };

    return this.model.findAll({
      where: whereClause,
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user' }] },
        { model: Teacher, as: 'supervisorTeacher', include: [{ model: User, as: 'user' }] }
      ],
      offset,
      limit,
      order
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
      throw new AppError('Thesis registration not found', 404);
    }
    registration.status = 'approved';
    registration.approvedByUserId = approvedByUserId;
    registration.decisionReason = decisionReason || null;
    registration.decidedAt = new Date();
    await registration.save();
    return registration;
  }

  async rejectRegistration(id: number, rejectedByUserId?: number, decisionReason?: string, transaction?: Transaction): Promise<ThesisRegistration | null> {
    const registration = await this.model.findByPk(id);
    if (!registration) {
      throw new AppError('Thesis registration not found', 404);
    }
    registration.status = 'rejected';
    registration.approvedByUserId = rejectedByUserId || null;
    registration.decisionReason = decisionReason || null;
    registration.decidedAt = new Date();
    await registration.save();
    return registration;
  }

  async cancelRegistration(id: number, cancelledByUserId: number, decisionReason?: string, transaction?: Transaction): Promise<ThesisRegistration | null> {
    const registration = await this.model.findByPk(id);
    if (!registration) {
      throw new AppError('Thesis registration not found', 404);
    }
    registration.status = 'cancelled';
    registration.approvedByUserId = cancelledByUserId;
    registration.decisionReason = decisionReason || null;
    registration.decidedAt = new Date();
    await registration.save();
    return registration;
  }
}