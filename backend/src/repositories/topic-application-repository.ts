import { Op, Transaction } from 'sequelize';
import { TopicApplication } from '../models/TopicApplication';
import { GenericRepository } from './generic-repository';
import { Topic } from '../models/Topic';
import { Student } from '../models/Student';
import { User } from '../models/User';
import { Semester } from '../models/Semester';

export class TopicApplicationRepository extends GenericRepository<TopicApplication, number> {
  constructor() {
    super(TopicApplication);
  }

  async findByStudentAndTopic(studentId: number, topicId: number, semesterId?: number): Promise<TopicApplication | null> {
    return TopicApplication.findOne({
      where: { studentId, topicId, ...(semesterId && { semesterId }) }
    });
  }

  async findByStudentId(studentId: number, semesterId?: number): Promise<TopicApplication[]> {
    return this.findAll({ studentId, ...(semesterId && { semesterId }) });
  }

  async findByTopicId(topicId: number, semesterId?: number): Promise<TopicApplication[]> {
    return this.findAll({ topicId, ...(semesterId && { semesterId }) });
  }

  async findByStatus(status: TopicApplication['status'], semesterId?: number): Promise<TopicApplication[]> {
    return this.findAll({ status, ...(semesterId && { semesterId }) });
  }

  // Update application status with optional note
  async updateStatus(
    id: number, 
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled', 
    note?: string,
    transaction?: Transaction
  ): Promise<TopicApplication | null> {
    const updates: Partial<TopicApplication> = { status, note: note || null };
    
    if (status === 'accepted' || status === 'rejected') {
      updates.decidedAt = new Date();
    }
    
    const instance = await this.findById(id);
    if (!instance) return null;
    
    return (await instance.update(updates, { transaction })) as TopicApplication;
  }

  async acceptApplication(id: number, note?: string, transaction?: Transaction): Promise<TopicApplication | null> {
    return this.updateStatus(id, 'accepted', note, transaction);
  }

  async rejectApplication(id: number, note?: string, transaction?: Transaction): Promise<TopicApplication | null> {
    return this.updateStatus(id, 'rejected', note, transaction);
  }

  async cancelApplication(id: number, note?: string, transaction?: Transaction): Promise<TopicApplication | null> {
    return this.updateStatus(id, 'cancelled', note, transaction);
  }

  // Semester-oriented methods

  // Find applications by semester through topics
  async findBySemesterId(semesterId: number): Promise<TopicApplication[]> {
    return TopicApplication.findAll({
      include: [{
        model: Topic,
        as: 'topic',
        where: { semesterId }
      }]
    });
  }

  // Find applications for the current active semester
  async findCurrentSemesterApplications(): Promise<TopicApplication[]> {
    const currentSemester = await Semester.findOne({
      where: { isActive: true }
    });
    
    if (!currentSemester) return [];
    
    return this.findBySemesterId(currentSemester.id);
  }

  // Find applications with full details including students and topics
  async findWithDetailsBySemester(semesterId: number): Promise<TopicApplication[]> {
    return TopicApplication.findAll({
      include: [
        {
          model: Student,
          as: 'student',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Topic,
          as: 'topic',
          where: { semesterId }
        }
      ]
    });
  }

  // Get semester application statistics
  async getSemesterApplicationStats(semesterId: number): Promise<{
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    cancelled: number;
  }> {
    const apps = await this.findBySemesterId(semesterId);
    
    return {
      total: apps.length,
      pending: apps.filter(app => app.status === 'pending').length,
      accepted: apps.filter(app => app.status === 'accepted').length,
      rejected: apps.filter(app => app.status === 'rejected').length,
      cancelled: apps.filter(app => app.status === 'cancelled').length
    };
  }

  // Find applications with proposal details
  async findWithProposals(semesterId?: number): Promise<TopicApplication[]> {
    const whereCondition: any = {
      [Op.or]: [
        { proposalTitle: { [Op.ne]: null } },
        { proposalAbstract: { [Op.ne]: null } },
        { proposalFileUrl: { [Op.ne]: null } }
      ]
    };

    const includeOptions: any[] = [];
    
    if (semesterId) {
      includeOptions.push({
        model: Topic,
        as: 'topic',
        where: { semesterId }
      });
    }

    return TopicApplication.findAll({
      where: whereCondition,
      include: includeOptions.length ? includeOptions : undefined
    });
  }

  // Find accepted applications by semester
  async findAcceptedBySemester(semesterId: number): Promise<TopicApplication[]> {
    return TopicApplication.findAll({
      where: { status: 'accepted' },
      include: [{
        model: Topic,
        as: 'topic',
        where: { semesterId }
      }]
    });
  }
}