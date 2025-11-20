import { SemesterRepository } from "../repositories/semester.repository";
import { Semester } from "../models/Semester";
import { AppError } from "../utils/AppError";

export class SystemService {
    private semesterRepository: SemesterRepository;

    constructor() {
        this.semesterRepository = new SemesterRepository();
    }

    // Semester Management
    async getActiveSemester() {
        return this.semesterRepository.findActiveSemester();
    }

    async getCurrentSemester() {
        return this.semesterRepository.findCurrentSemester();
    }

    async setActiveSemester(semesterId: number) {
        const semester = await this.semesterRepository.findById(semesterId);
        if (!semester) throw new AppError('No semester found', 400, 'SEMESTER_NOT_FOUND');
        await this.semesterRepository.activateSemester(semester.id);
        return semester;
    }

    async unsetActiveSemester(semesterId: number) {
        const semester = await this.semesterRepository.findById(semesterId);
        if (!semester) throw new AppError('No semester found', 400, 'SEMESTER_NOT_FOUND');
        await this.semesterRepository.deactivateSemester(semester.id);
        return semester;
    }

    async setCurrentSemester(semesterId: number) {
        const semester = await this.semesterRepository.findById(semesterId);
        if (!semester) throw new AppError('No semester found', 400, 'SEMESTER_NOT_FOUND');
        await this.semesterRepository.update(semester.id, { isCurrent: true });
        return semester;
    }

    async unsetCurrentSemester(semesterId: number) {
        const semester = await this.semesterRepository.findById(semesterId);
        if (!semester) throw new AppError('No semester found', 400, 'SEMESTER_NOT_FOUND');
        await this.semesterRepository.update(semester.id, { isCurrent: false });
        return semester;
    }

    async getAllSemesters() {
        return this.semesterRepository.findAll({}, 0, undefined, [['startDate', 'DESC']]);
    }

    async createSemester(data: Partial<Semester>) {
        return this.semesterRepository.create(data);
    }

    async deleteSemester(semesterId: number) {
        return this.semesterRepository.delete(semesterId);
    }


}