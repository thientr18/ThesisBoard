import { SemesterRepository } from '../repositories/semester.repository';
import { Semester } from '../models/Semester';
import { AppError } from '../utils/AppError';

export class SemesterService {
    private repository: SemesterRepository;

    constructor() {
        this.repository = new SemesterRepository();
    }

    async getAllSemesters(): Promise<Semester[]> {
        return this.repository.findAll();
    }

    async getSemesterById(id: number): Promise<Semester | null> {
        return this.repository.findById(id);
    }

    async getActiveSemester(): Promise<Semester | null> {
        return this.repository.findActiveSemester();
    }

    async createSemester(semesterData: Omit<Semester, 'id'>): Promise<Semester> {
        // Validate semester dates
        if (semesterData.startDate >= semesterData.endDate) {
            throw new AppError('Start date must be before end date', 400, 'INVALID_DATES');
        }
        
        // Check if semester code already exists
        const existingSemester = await this.repository.findByCode(semesterData.code);
        if (existingSemester) {
            throw new AppError('Semester with this code already exists', 400, 'SEMESTER_CODE_EXISTS');
        }

        return this.repository.create(semesterData as Semester);
    }

    async updateSemester(id: number, semesterData: Partial<Semester>): Promise<Semester | null> {
        // Validate dates if they're being updated
        if (semesterData.startDate && semesterData.endDate && 
            new Date(semesterData.startDate) >= new Date(semesterData.endDate)) {
            throw new AppError('Start date must be before end date', 400, 'INVALID_DATES');
        }
        
        // Check if updated code already exists (if code is being updated)
        if (semesterData.code) {
            const existingSemester = await this.repository.findByCode(semesterData.code);
            if (existingSemester && existingSemester.id !== id) {
                throw new AppError('Semester with this code already exists', 400, 'SEMESTER_CODE_EXISTS');
            }
        }

        await this.repository.update(id, semesterData);
        return this.repository.findById(id);
    }

    async deleteSemester(id: number): Promise<void> {
        // Check if semester exists
        const semester = await this.repository.findById(id);
        if (!semester) {
            throw new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND');
        }

        // Don't allow deleting active semester
        if (semester.isActive) {
            throw new AppError('Cannot delete active semester', 400, 'ACTIVE_SEMESTER');
        }

        await this.repository.deleteById(id);
    }

    async activateSemester(id: number): Promise<void> {
        // Check if semester exists
        const semester = await this.repository.findById(id);
        if (!semester) {
            throw new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND');
        }

        await this.repository.activateSemester(id);
    }

    async deactivateSemester(id: number): Promise<void> {
        // Check if semester exists
        const semester = await this.repository.findById(id);
        if (!semester) {
            throw new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND');
        }

        await this.repository.deactivateSemester(id);
    }
}