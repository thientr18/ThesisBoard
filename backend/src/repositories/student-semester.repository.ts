import { GenericRepository } from './generic.repository';
import { StudentSemester } from '../models/StudentSemester';
import { Op } from 'sequelize';

export class StudentSemesterRepository extends GenericRepository<StudentSemester, number> {
    constructor() {
        super(StudentSemester);
    }

    async findByStudentId(studentId: number): Promise<StudentSemester[]> {
        return this.model.findAll({
            where: { studentId },
            order: [['semesterId', 'DESC']]
        });
    }

    async findBySemesterId(semesterId: number): Promise<StudentSemester[]> {
        return this.model.findAll({
            where: { semesterId }
        });
    }

    async findByStudentAndSemester(studentId: number, semesterId: number): Promise<StudentSemester | null> {
        return this.model.findOne({
            where: { 
                studentId,
                semesterId
            }
        });
    }

    async findByType(type: 'pre-thesis' | 'thesis', semesterId?: number): Promise<StudentSemester[]> {
        return this.model.findAll({
            where: { type, ...(semesterId && { semesterId }) }
        });
    }

    async findByStatus(status: StudentSemester['status'], semesterId?: number): Promise<StudentSemester[]> {
        return this.model.findAll({
            where: { status, ...(semesterId && { semesterId }) }
        });
    }

    async findByGpaRange(minGpa: number, maxGpa: number, semesterId?: number): Promise<StudentSemester[]> {
        return this.model.findAll({
            where: {
                gpa: {
                    [Op.between]: [minGpa, maxGpa]
                },
                ...(semesterId && { semesterId })
            }
        });
    }

    async findByCreditsRange(minCredits: number, maxCredits: number, semesterId?: number): Promise<StudentSemester[]> {
        return this.model.findAll({
            where: {
                credits: {
                    [Op.between]: [minCredits, maxCredits]
                },
                ...(semesterId && { semesterId })
            }
        });
    }

    async findWithMissingData(semesterId?: number): Promise<StudentSemester[]> {
        return this.model.findAll({
            where: {
                [Op.or]: [
                    { gpa: null },
                    { credits: null }
                ],
                ...(semesterId && { semesterId })
            }
        });
    }

    async countBySemester(semesterId: number, status?: StudentSemester['status']): Promise<number> {
        return this.model.count({
            where: { semesterId, ...(status && { status }) }
        });
    }

    async findEligibleForGraduation(minGpa: number = 2.0, semesterId?: number): Promise<StudentSemester[]> {
        return this.model.findAll({
            where: {
                status: 'completed',
                gpa: { [Op.gte]: minGpa },
                ...(semesterId && { semesterId })
            }
        });
    }
    async updateStatus(id: number, status: StudentSemester['status']): Promise<StudentSemester | null> {
        return this.update(id, { status });
    }
}