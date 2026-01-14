import { ThesisAssignment } from '../models/ThesisAssignment';
import { GenericRepository } from './generic.repository';
import { Op } from 'sequelize';
import { Teacher } from '../models/Teacher';
import { User } from '../models/User';

export class ThesisAssignmentRepository extends GenericRepository<ThesisAssignment, number> {
  constructor() {
    super(ThesisAssignment);
  }

  async findByThesisId(thesisId: number, semesterId?: number): Promise<ThesisAssignment[]> {
    return this.model.findAll({
      where: { thesisId, ...(semesterId && { semesterId }) },
      include: [
        { 
          model: Teacher, 
          as: 'teacher',
          include: [{ model: User, as: 'user' }]
        }
      ]
    });
  }

  async findByTeacherId(teacherId: number, semesterId?: number): Promise<ThesisAssignment[]> {
    return this.model.findAll({
      where: { teacherId, ...(semesterId && { semesterId }) }
    });
  }

  async findByRole(role: ThesisAssignment['role'], semesterId?: number): Promise<ThesisAssignment[]> {
    return this.model.findAll({
      where: { role, ...(semesterId && { semesterId }) }
    });
  }

  async findTeachersByThesisId(thesisId: number): Promise<number[]> {
    const assignments = await this.model.findAll({
      attributes: ['teacherId'],
      where: { thesisId },
      raw: true
    });
    return assignments.map(assignment => assignment.teacherId);
  }

  // Find all theses assigned to a teacher
  async findThesesByTeacherId(teacherId: number): Promise<number[]> {
    const assignments = await this.model.findAll({
      attributes: ['thesisId'],
      where: { teacherId },
      raw: true
    });
    return [...new Set(assignments.map(a => a.thesisId))];
  }

  // Update or create an assignment
  async assignTeacher(
    thesisId: number,
    teacherId: number,
    role: ThesisAssignment['role'],
    assignedByUserId: number
  ): Promise<ThesisAssignment> {
    // Tìm cả bản ghi đã bị xóa mềm (paranoid: false)
    let assignment = await this.model.findOne({
      where: { thesisId, teacherId, role },
      paranoid: false
    });

    if (assignment) {
      if (assignment.deletedAt) {
        await assignment.restore();
      }
      await assignment.update({
        assignedByUserId,
        assignedAt: new Date()
      });
      return assignment;
    }

    const [newAssignment] = await this.model.findOrCreate({
      where: { thesisId, teacherId, role },
      defaults: {
        thesisId,
        teacherId,
        role,
        assignedByUserId,
        assignedAt: new Date()
      }
    });

    return newAssignment;
  }

  async removeAssignment(
    thesisId: number,
    teacherId: number,
    role: ThesisAssignment['role']
  ): Promise<boolean> {
    const deleted = await this.model.destroy({
      where: { thesisId, teacherId, role }
    });
    return deleted > 0;
  }
}