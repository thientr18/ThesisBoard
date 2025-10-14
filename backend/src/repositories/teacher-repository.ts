import { Teacher } from '../models/Teacher';
import { GenericRepository } from './generic-repository';

export class TeacherRepository extends GenericRepository<Teacher, number> {
  constructor() {
    super(Teacher);
  }

  async findByUserId(userId: number): Promise<Teacher | null> {
    return Teacher.findOne({
      where: { userId }
    });
  }

  async findByCode(teacherCode: string): Promise<Teacher | null> {
    return Teacher.findOne({
      where: { teacherCode }
    });
  }

  async findByOffice(office: string): Promise<Teacher[]> {
    return Teacher.findAll({
      where: { office }
    });
  }

  async findByEmail(email: string): Promise<Teacher[]> {
    return Teacher.findAll({
      where: { email }
    });
  }

  async findAllWithUserInfo(filters?: any): Promise<Teacher[]> {
    return Teacher.findAll({
      where: filters || {},
      include: [{ 
        association: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
    });
  }

  async searchTeachers(query: string): Promise<Teacher[]> {
    const { Op } = require('sequelize');
    return Teacher.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.like]: `%${query}%` } },
          { teacherCode: { [Op.like]: `%${query}%` } }
        ]
      }
    });
  }
}