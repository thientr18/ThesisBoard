import { ThesisAssignment } from '../models/ThesisAssignment';
import { GenericRepository } from './GenericRepository';
import { Op } from 'sequelize';

export class ThesisAssignmentRepository extends GenericRepository<ThesisAssignment, number> {
  constructor() {
    super(ThesisAssignment);
  }

  async findByThesisId(thesisId: number, semesterId?: number): Promise<ThesisAssignment[]> {
    return this.model.findAll({
      where: { thesisId, ...(semesterId && { semesterId }) }
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
    const [assignment, created] = await this.model.findOrCreate({
      where: { thesisId, teacherId, role },
      defaults: {
        thesisId,
        teacherId,
        role,
        assignedByUserId,
        assignedAt: new Date()
      }
    });

    if (!created) {
      // Update the assignedByUserId and assignedAt if the record already exists
      await assignment.update({
        assignedByUserId,
        assignedAt: new Date()
      });
    }

    return assignment;
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