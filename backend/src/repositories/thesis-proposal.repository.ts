import { Op } from 'sequelize';
import ThesisProposal from '../models/ThesisProposal';
import { GenericRepository } from './generic.repository';
import { sequelize } from '../models/db';

export class ThesisProposalRepository extends GenericRepository<ThesisProposal, number> {
  constructor() {
    super(ThesisProposal);
  }

  async findByStudentId(studentId: number, semesterId?: number): Promise<ThesisProposal[]> {
    return ThesisProposal.findAll({
      where: { studentId, ...(semesterId && { semesterId }) },
      order: [['createdAt', 'DESC']]
    });
  }

  async findByTeacherId(teacherId: number, semesterId?: number): Promise<ThesisProposal[]> {
    return ThesisProposal.findAll({
      where: { targetTeacherId: teacherId, ...(semesterId && { semesterId }) },
      order: [['createdAt', 'DESC']]
    });
  }

  async findBySemesterId(semesterId: number): Promise<ThesisProposal[]> {
    return ThesisProposal.findAll({
      where: { semesterId },
      order: [['createdAt', 'DESC']]
    });
  }

  async findByStatus(status: ThesisProposal['status'], semesterId?: number): Promise<ThesisProposal[]> {
    return ThesisProposal.findAll({
      where: { status, ...(semesterId && { semesterId }) },
      order: [['createdAt', 'DESC']]
    });
  }

  async findByTeacherAndSemester(teacherId: number, semesterId: number, status?: ThesisProposal['status']): Promise<ThesisProposal[]> {
    const whereClause: any = {
      targetTeacherId: teacherId,
      semesterId
    };

    if (status) {
      whereClause.status = status;
    }

    return ThesisProposal.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
  }

  async findActiveProposalForStudent(studentId: number, semesterId: number): Promise<ThesisProposal | null> {
    return ThesisProposal.findOne({
      where: {
        studentId,
        semesterId,
        status: {
          [Op.in]: ['submitted', 'accepted']
        }
      }
    });
  }

  async acceptProposal(id: number, note?: string): Promise<ThesisProposal | null> {
    const proposal = await this.findById(id);
    if (!proposal) return null;

    return proposal.update({
      status: 'accepted',
      note: note || proposal.note,
      decidedAt: new Date()
    });
  }

  async rejectProposal(id: number, note?: string): Promise<ThesisProposal | null> {
    const proposal = await this.findById(id);
    if (!proposal) return null;

    return proposal.update({
      status: 'rejected',
      note: note || proposal.note,
      decidedAt: new Date()
    });
  }

  async cancelProposal(id: number, note?: string): Promise<ThesisProposal | null> {
    const proposal = await this.findById(id);
    if (!proposal) return null;

    return proposal.update({
      status: 'cancelled',
      note: note || proposal.note
    });
  }

  async getStatsBySemester(semesterId: number): Promise<Record<string, number>> {
    const stats: Record<string, number> = {
      submitted: 0,
      accepted: 0,
      rejected: 0,
      cancelled: 0,
      total: 0
    };
    
    const proposals = await ThesisProposal.findAll({
      where: { semesterId },
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
      group: ['status']
    });
    
    proposals.forEach((result: any) => {
      stats[result.status] = parseInt(result.getDataValue('count'), 10);
      stats.total += parseInt(result.getDataValue('count'), 10);
    });
    
    return stats;
  }
}

export default new ThesisProposalRepository();