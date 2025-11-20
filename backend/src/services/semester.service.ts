import { SemesterRepository } from '../repositories/semester.repository';
import { StudentSemesterRepository } from '../repositories/student-semester.repository';
import { TeacherAvailabilityRepository } from '../repositories/teacher-availability.repository';
import { Semester } from '../models/Semester';
import { StudentSemester } from '../models/StudentSemester';
import { Student } from '../models/Student';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';

export class SemesterService {
    private semesterRepository: SemesterRepository;
    private studentSemesterRepository: StudentSemesterRepository;
    private teacherAvailabilityRepository: TeacherAvailabilityRepository;

    constructor() {
        this.semesterRepository = new SemesterRepository();
        this.studentSemesterRepository = new StudentSemesterRepository();
        this.teacherAvailabilityRepository = new TeacherAvailabilityRepository();
    }

    async getAllSemesters() {
        return this.semesterRepository.findAll({}, 0, undefined, [['startDate', 'DESC']]);
    }

    async getSemesterById(semesterId: number) {
        return this.semesterRepository.findById(semesterId);
    }
    async createSemester(data: Partial<Semester>) {
        return this.semesterRepository.create(data);
    }

    async updateSemester(semesterId: number, data: Partial<Semester>) {
        const semester = await this.semesterRepository.findById(semesterId);
        if (!semester) throw new AppError('No semester found', 404, 'SEMESTER_NOT_FOUND');
        return this.semesterRepository.update(semesterId, data);
    }

    async deleteSemester(semesterId: number) {
        return this.semesterRepository.delete(semesterId);
    }

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

    async getStudentsInSemester(semesterId: number) {
        return this.studentSemesterRepository.getStudentsInSemester(semesterId);
    }

    async getStudentSemester(studentId: number, semesterId: number) {
        return this.studentSemesterRepository.getStudentSemester(studentId, semesterId);
    }

    async addStudentToSemester(data: Partial<StudentSemester>) {
        return this.studentSemesterRepository.create(data);
    }

    async updateStudentInSemester(id: number, data: any) {
        return this.studentSemesterRepository.update(id, data);
    }

    async deleteStudentFromSemester(id: number) {
        return this.studentSemesterRepository.delete(id);
    }

    async getStudentSemesters(studentId: number) {
        return this.studentSemesterRepository.getSemestersForStudent(studentId);
    }

    async getTeachersInSemester(semesterId: number) {
        return this.teacherAvailabilityRepository.getTeachersInSemester(semesterId);
    }
}