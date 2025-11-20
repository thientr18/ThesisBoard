import { GenericRepository } from './generic.repository';
import { TeacherAvailability } from '../models/TeacherAvailability';
import { Teacher } from '../models/Teacher';
import { User } from '../models/User';
import { Op } from 'sequelize';

export class TeacherAvailabilityRepository extends GenericRepository<TeacherAvailability, number> {
  constructor() {
    super(TeacherAvailability);
  }

  async getTeachersInSemester(semesterId: number): Promise<TeacherAvailability[]> {
    return this.model.findAll({
      where: { semesterId },
      include: [
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['id', 'teacherCode', 'title', 'office', 'phone'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['email', 'fullName']
            }
          ]
        }
      ]
    });
  }

  async findByTeacherAndSemester(teacherId: number, semesterId: number): Promise<TeacherAvailability | null> {
    return this.model.findOne({
      where: { teacherId, semesterId }
    });
  }

  /**
   * Decrease pre-thesis capacity for a teacher
   * Returns false if no capacity available
   */
  async decreasePreThesisCapacity(teacherId: number, semesterId: number): Promise<boolean> {
    const availability = await this.findByTeacherAndSemester(teacherId, semesterId);
    
    if (!availability || availability.maxPreThesis <= 0 || !availability.isOpen) {
      return false;
    }

    await availability.update({
      maxPreThesis: availability.maxPreThesis - 1
    });
    
    return true;
  }

  /**
   * Decrease thesis capacity for a teacher
   * Returns false if no capacity available
   */
  async decreaseThesisCapacity(teacherId: number, semesterId: number): Promise<boolean> {
    const availability = await this.findByTeacherAndSemester(teacherId, semesterId);
    
    if (!availability || availability.maxThesis <= 0 || !availability.isOpen) {
      return false;
    }

    await availability.update({
      maxThesis: availability.maxThesis - 1
    });
    
    return true;
  }

  /**
   * Increase pre-thesis capacity for a teacher
   */
  async increasePreThesisCapacity(teacherId: number, semesterId: number): Promise<boolean> {
    const availability = await this.findByTeacherAndSemester(teacherId, semesterId);
    
    if (!availability) {
      return false;
    }

    await availability.update({
      maxPreThesis: availability.maxPreThesis + 1
    });
    
    return true;
  }

  /**
   * Increase thesis capacity for a teacher
   */
  async increaseThesisCapacity(teacherId: number, semesterId: number): Promise<boolean> {
    const availability = await this.findByTeacherAndSemester(teacherId, semesterId);
    
    if (!availability) {
      return false;
    }

    await availability.update({
      maxThesis: availability.maxThesis + 1
    });
    
    return true;
  }
}