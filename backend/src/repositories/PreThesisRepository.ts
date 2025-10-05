import { Op } from 'sequelize';
import { PreThesis } from '../models/PreThesis';
import { GenericRepository } from './GenericRepository';

export class PreThesisRepository extends GenericRepository<PreThesis, number> {
  constructor() {
    super(PreThesis);
  }

  async findByStudentAndSemester(studentId: number, semesterId: number): Promise<PreThesis | null> {
    return this.model.findOne({
      where: {
        studentId,
        semesterId
      }
    });
  }

  async findBySupervisor(supervisorTeacherId: number, semesterId?: number): Promise<PreThesis[]> {
    return this.model.findAll({
      where: {
        supervisorTeacherId,
        ...(semesterId && { semesterId })
      }
    });
  }

  async findByStatus(status: PreThesis['status'], semesterId?: number): Promise<PreThesis[]> {
    return this.model.findAll({
      where: {
        status,
        ...(semesterId && { semesterId })
      }
    });
  }

  async findByTopic(topicId: number, semesterId?: number): Promise<PreThesis[]> {
    return this.model.findAll({
      where: {
        topicId,
        ...(semesterId && { semesterId })
      }
    });
  }

  async findByStudent(studentId: number, semesterId?: number): Promise<PreThesis[]> {
    return this.model.findAll({
      where: {
        studentId,
        ...(semesterId && { semesterId })
      }
    });
  }

  async findBySemester(semesterId: number): Promise<PreThesis[]> {
    return this.model.findAll({
      where: {
        semesterId
      }
    });
  }

  async updateStatus(id: number, status: PreThesis['status']): Promise<PreThesis | null> {
    return this.update(id, { status });
  }

  async updateFinalScore(id: number, finalScore: number): Promise<PreThesis | null> {
    return this.update(id, { finalScore });
  }

  async findCompletedWithPassingScore(minimumScore: number = 5.0, semesterId?: number): Promise<PreThesis[]> {
    return this.model.findAll({
      where: {
        status: 'completed',
        finalScore: {
          [Op.gte]: minimumScore
        },
        ...(semesterId && { semesterId })
      }
    });
  }
}