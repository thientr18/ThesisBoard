import { GenericRepository } from './generic.repository';
import { TeacherAvailability } from '../models/TeacherAvailability';
import { Op } from 'sequelize';

export class TeacherAvailabilityRepository extends GenericRepository<TeacherAvailability, number> {
  constructor() {
    super(TeacherAvailability);
  }

  async findByTeacherAndSemester(teacherId: number, semesterId: number): Promise<TeacherAvailability | null> {
    return this.model.findOne({
      where: {
        teacherId,
        semesterId
      }
    });
  }

  async findAllByTeacher(teacherId: number): Promise<TeacherAvailability[]> {
    return this.model.findAll({
      where: {
        teacherId
      },
      order: [['semesterId', 'DESC']]
    });
  }

  async findAllBySemester(semesterId: number): Promise<TeacherAvailability[]> {
    return this.model.findAll({
      where: {
        semesterId
      }
    });
  }

  async findAvailableTeachers(semesterId: number): Promise<TeacherAvailability[]> {
    return this.model.findAll({
      where: {
        semesterId,
        isOpen: true
      }
    });
  }

  async findTeachersWithPreThesisCapacity(semesterId: number): Promise<TeacherAvailability[]> {
    return this.model.findAll({
      where: {
        semesterId,
        isOpen: true,
        maxPreThesis: {
          [Op.gt]: 0
        }
      }
    });
  }

  async findTeachersWithThesisCapacity(semesterId: number): Promise<TeacherAvailability[]> {
    return this.model.findAll({
      where: {
        semesterId,
        isOpen: true,
        maxThesis: {
          [Op.gt]: 0
        }
      }
    });
  }

  async setMaxPreThesis(teacherId: number, semesterId: number, maxPreThesis: number): Promise<boolean> {
    const availability = await this.findByTeacherAndSemester(teacherId, semesterId);
    if (!availability) {
      return false;
    }
    await availability.update({ maxPreThesis });
    return true;
  }

  async setMaxThesis(teacherId: number, semesterId: number, maxThesis: number): Promise<boolean> {
    const availability = await this.findByTeacherAndSemester(teacherId, semesterId);
    if (!availability) {
      return false;
    }
    await availability.update({ maxThesis });
    return true;
  }

  async setAvailabilityOpen(teacherId: number, semesterId: number, isOpen: boolean): Promise<boolean> {
    const availability = await this.findByTeacherAndSemester(teacherId, semesterId);
    if (!availability) {
      return false;
    }
    await availability.update({ isOpen });
    return true;
  }

  async setAvailabilityClosed(teacherId: number, semesterId: number, isOpen: boolean): Promise<boolean> {
    const availability = await this.findByTeacherAndSemester(teacherId, semesterId);
    if (!availability) {
      return false;
    }
    await availability.update({ isOpen });
    return true;
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