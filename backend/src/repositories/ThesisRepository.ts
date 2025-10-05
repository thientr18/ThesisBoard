import { Op } from 'sequelize';
import { GenericRepository } from './GenericRepository';
import { Thesis } from '../models/Thesis';

export class ThesisRepository extends GenericRepository<Thesis, number> {
  constructor() {
    super(Thesis);
  }

  async findByStudentId(studentId: number, semesterId?: number): Promise<Thesis[]> {
    return this.model.findAll({
      where: { studentId, ...(semesterId && { semesterId }) }
    });
  }

  async findBySupervisorId(supervisorId: number, semesterId?: number): Promise<Thesis[]> {
    return this.model.findAll({
      where: { supervisorTeacherId: supervisorId, ...(semesterId && { semesterId }) }
    });
  }
  
  async findBySemesterId(semesterId: number): Promise<Thesis[]> {
    return this.model.findAll({
      where: { semesterId }
    });
  }
  
  async findByStatus(status: Thesis['status']): Promise<Thesis[]> {
    return this.model.findAll({
      where: { status }
    });
  }
  
  async findByStudentAndSemester(studentId: number, semesterId: number): Promise<Thesis | null> {
    return this.model.findOne({
      where: { 
        studentId,
        semesterId
      }
    });
  }
  
  // Check if a student already has a thesis in a semester (utilizing unique constraint)
  async hasThesisInSemester(studentId: number, semesterId: number): Promise<boolean> {
    const count = await this.model.count({
      where: { 
        studentId,
        semesterId
      }
    });
    return count > 0;
  }
  
  async updateStatus(id: number, status: Thesis['status']): Promise<Thesis | null> {
    return this.update(id, { status });
  }
  
  async searchByTitle(searchTerm: string): Promise<Thesis[]> {
    return this.model.findAll({
      where: {
        title: {
          [Op.like]: `%${searchTerm}%`
        }
      }
    });
  }

  async searchThesesByFilter(filter: {
    studentId?: number;
    supervisorTeacherId?: number;
    semesterId?: number;
    status?: Thesis['status'];
    titleContains?: string;
  }): Promise<Thesis[]> {
    const whereClause: any = {};

    if (filter.studentId !== undefined) {
      whereClause.studentId = filter.studentId;
    }
    if (filter.supervisorTeacherId !== undefined) {
        whereClause.supervisorTeacherId = filter.supervisorTeacherId;
    }
    if (filter.semesterId !== undefined) {
        whereClause.semesterId = filter.semesterId;
    }
    if (filter.status !== undefined) {
        whereClause.status = filter.status;
    }
    if (filter.titleContains !== undefined) {
        whereClause.title = { [Op.like]: `%${filter.titleContains}%` };
    }
    return this.model.findAll({ where: whereClause });
  }
  
  async findActiveTheses(): Promise<Thesis[]> {
    return this.model.findAll({
      where: {
        status: {
          [Op.notIn]: ['completed', 'cancelled']
        }
      }
    });
  }
  
  async findCompletedTheses(): Promise<Thesis[]> {
    return this.model.findAll({
      where: {
        status: 'completed'
      }
    });
  }
}