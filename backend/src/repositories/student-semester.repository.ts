import { GenericRepository } from './generic.repository';
import { StudentSemester } from '../models/StudentSemester';
import { Student } from '../models/Student';
import { User } from '../models/User';
import { Op } from 'sequelize';

export class StudentSemesterRepository extends GenericRepository<StudentSemester, number> {
    constructor() {
        super(StudentSemester);
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

    async getStudentsInSemester(semesterId: number): Promise<any[]> {
        return this.model.findAll({
            where: { semesterId },
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'studentIdCode', 'cohortYear', 'className', 'phone', 'dob', 'gender', 'status'],
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

    async getSemestersForStudent(studentId: number): Promise<any[]> {
        return this.model.findAll({
            where: { studentId },
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'studentIdCode', 'cohortYear', 'className', 'phone', 'dob', 'gender', 'status'],
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

    async getStudentSemester(studentId: number, semesterId: number): Promise<any | null> {
        return this.model.findOne({
            where: { studentId, semesterId },
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'studentIdCode', 'cohortYear', 'className', 'phone', 'dob', 'gender', 'status'],
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








}