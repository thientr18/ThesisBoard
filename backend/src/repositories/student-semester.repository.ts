import { GenericRepository } from './generic.repository';
import { StudentSemester } from '../models/StudentSemester';
import { Student } from '../models/Student';
import { User } from '../models/User';
import { Op, fn, col, where } from "sequelize";

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

    async getStudentsInSemester(
        semesterId: number,
        page = 1,
        pageSize = 15,
        search?: string,
        studentCode?: string,
        status?: string,
        type?: string
    ) {
        const offset = (page - 1) * pageSize;
        const whereClause: any = { semesterId };
        if (status && status !== "all") whereClause.status = status;
        if (type && type !== "all") whereClause.type = type;

        // Build include for Student and User
        const studentInclude: any = {
            model: Student,
            as: 'student',
            attributes: [
                'id',
                'studentIdCode',
                'cohortYear',
                'className',
                'phone',
                'dob',
                'gender',
                'status'
            ],
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'fullName', 'email'],
                where: {},
                required: false
            }],
            where: {},
            required: false
        };

        let hasStudentFilter = false;

        // Filter by studentCode
        if (studentCode && studentCode !== "all") {
            studentInclude.where.studentIdCode = { [Op.like]: `%${studentCode.toLowerCase()}%` };
            hasStudentFilter = true;
        }

        // Filter by search (fullName)
        if (search && search.trim() !== "") {
            studentInclude.include[0].where = {
                ...studentInclude.include[0].where,
                [Op.and]: [
                    where(fn('LOWER', col('student->user.full_name')), {
                        [Op.like]: `%${search.toLowerCase()}%`
                    })
                ]
            };
            studentInclude.include[0].required = true;
            hasStudentFilter = true;
        }

        // Nếu có filter theo student hoặc user, dùng INNER JOIN (required: true)
        if (hasStudentFilter) {
            studentInclude.required = true;
        }

        const { rows, count } = await StudentSemester.findAndCountAll({
            where: whereClause,
            include: [studentInclude],
            offset,
            limit: pageSize,
            order: [['id', 'ASC']]
        });

        return {
            students: rows,
            total: count,
            page,
            pageSize
        };
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

    async getStudentInActiveSemester(studentId: number): Promise<any | null> {
        return this.model.findOne({
            where: { studentId },
        });
    }

}