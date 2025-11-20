import { GenericRepository } from './generic.repository';
import { Student } from '../models/Student';
import { Op } from 'sequelize';

export class StudentRepository extends GenericRepository<Student, number> {
    constructor() {
        super(Student);
    }

    async findByStudentIdCode(studentIdCode: string): Promise<Student | null> {
        return this.model.findOne({
            where: { studentIdCode }
        });
    }

    async findByUserId(userId: number): Promise<Student | null> {
        return this.model.findOne({
            where: { userId }
        });
    }

    async findByStatus(status: Student['status']): Promise<Student[]> {
        return this.model.findAll({
            where: { status }
        });
    }

    async findByCohortYear(cohortYear: number): Promise<Student[]> {
        return this.model.findAll({
            where: { cohortYear }
        });
    }

    async findByClassName(className: string): Promise<Student[]> {
        return this.model.findAll({
            where: { className }
        });
    }

    async searchByName(name: string): Promise<Student[]> {
        return this.model.findAll({
            include: [{
                association: 'user',
                where: {
                    [Op.or]: [
                        { firstName: { [Op.like]: `%${name}%` } },
                        { lastName: { [Op.like]: `%${name}%` } }
                    ]
                }
            }]
        });
    }

    async findActiveStudentsByCohort(cohortYear: number): Promise<Student[]> {
        return this.model.findAll({
            where: {
                status: 'active',
                cohortYear
            }
        });
    }

    async findGraduatedStudents(): Promise<Student[]> {
        return this.model.findAll({
            where: { status: 'graduated' }
        });
    }

    async countStudentsByStatus(): Promise<{ status: string; count: number }[]> {
        type StatusCountResult = { status: string; count: string };
        
        const results = await this.model.findAll({
            attributes: [
                'status',
                [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('status')), 'count']
            ],
            group: ['status'],
            raw: true
        }) as unknown as StatusCountResult[];
        
        return results.map(result => ({
            status: result.status,
            count: parseInt(result.count, 10)
        }));
    }

    async countStudentsByCohort(): Promise<{ cohortYear: number; count: number }[]> {
        type CohortCountResult = { cohortYear: number; count: string };
        
        const results = await this.model.findAll({
            attributes: [
                'cohortYear',
                [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('cohort_year')), 'count']
            ],
            group: ['cohortYear'],
            raw: true
        }) as unknown as CohortCountResult[];
        
        return results.map(result => ({
            cohortYear: result.cohortYear,
            count: parseInt(result.count, 10)
        }));
    }

    /**
     * Find students with pagination support
     */
    async findAllPaginated(page: number, pageSize: number, filters?: any): Promise<{ rows: Student[]; count: number }> {
        const offset = (page - 1) * pageSize;
        return this.model.findAndCountAll({
            where: filters || {},
            limit: pageSize,
            offset,
            order: [['createdAt', 'DESC']]
        });
    }
    
    /**
     * Find students by gender
     */
    async findByGender(gender: 'male' | 'female' | 'other'): Promise<Student[]> {
        return this.model.findAll({
            where: { gender }
        });
    }

    async findWithUserData(filters?: any): Promise<Student[]> {
        return this.model.findAll({
            where: filters || {},
            include: [{
                association: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }]
        });
    }

    async findWithMissingContactInfo(): Promise<Student[]> {
        return this.model.findAll({
            where: {
                [Op.or]: [
                    { phone: null },
                    { phone: '' }
                ]
            }
        });
    }

    async countStudentsByClass(): Promise<{ className: string; count: number }[]> {
        type ClassCountResult = { className: string; count: string };
        
        const results = await this.model.findAll({
            attributes: [
                'className',
                [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('class_name')), 'count']
            ],
            group: ['className'],
            raw: true
        }) as unknown as ClassCountResult[];
        
        return results.map(result => ({
            className: result.className || 'Unassigned',
            count: parseInt(result.count, 10)
        }));
    }

    async findRecentlyAdded(days: number = 30): Promise<Student[]> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return this.model.findAll({
            where: {
                ['createdAt' as keyof Student]: {
                    [Op.gte]: cutoffDate
                }
            },
            order: [['createdAt', 'DESC']]
        });
    }
}
