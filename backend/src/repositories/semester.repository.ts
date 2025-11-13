import { GenericRepository } from './generic.repository';
import { Semester } from '../models/Semester';
import { UpdateOptions, FindOptions } from 'sequelize';

export class SemesterRepository extends GenericRepository<Semester, number> {
    constructor() {
        super(Semester);
    }

    async findActiveSemester(): Promise<Semester | null> {
        return await this.model.findOne({ where: { isActive: true } });
    }

    async activateSemester(semesterId: number): Promise<void> {
        // Deactivate all semesters
        await this.model.update({ isActive: false }, { where: {} } as UpdateOptions);
        // Activate the specified semester
        await this.model.update({ isActive: true }, { where: { id: semesterId } } as UpdateOptions);
    }

    async deactivateSemester(semesterId: number): Promise<void> {
        await this.model.update({ isActive: false }, { where: { id: semesterId } } as UpdateOptions);
    }

    async findByCode(code: string): Promise<Semester | null> {
        return await this.model.findOne({ where: { code } } as FindOptions);
    }

    async deleteById(semesterId: number): Promise<void> {
        await this.model.destroy({ where: { id: semesterId } });
    }
}