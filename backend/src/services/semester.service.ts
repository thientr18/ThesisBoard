import { SemesterRepository } from '../repositories/semester.repository';
import { StudentSemesterRepository } from '../repositories/student-semester.repository';
import { TeacherAvailabilityRepository } from '../repositories/teacher-availability.repository';
import { Semester } from '../models/Semester';
import { StudentSemester } from '../models/StudentSemester';
import { Student } from '../models/Student';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { PreThesis } from '../models/PreThesis';
import { Topic } from '../models/Topic';
import { Thesis } from '../models/Thesis';
import { TeacherAvailability } from '../models/TeacherAvailability';

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

    async getStudentsInSemester(
        semesterId: number,
        page = 1,
        pageSize = 15,
        search?: string,
        studentCode?: string,
        status?: string,
        type?: string
    ) {
        return this.studentSemesterRepository.getStudentsInSemester(
            semesterId,
            page,
            pageSize,
            search,
            studentCode,
            status,
            type
        );
    }

    async getStudentSemester(studentId: number, semesterId: number) {
        return this.studentSemesterRepository.getStudentSemester(studentId, semesterId);
    }
    async getStudentInActiveSemester(studentId: number) {
        return this.studentSemesterRepository.getStudentInActiveSemester(studentId);
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

    async getTeacherSemesters(teacherId: number) {
        return this.teacherAvailabilityRepository.getSemestersForTeacher(teacherId);
    }

    async getTeacherSemester(teacherId: number, semesterId: number) {
        return this.teacherAvailabilityRepository.getTeacherSemester(teacherId, semesterId);
    }

    async addTeacherToSemester(data: Partial<any>) {
        return this.teacherAvailabilityRepository.create(data);
    }

    async updateTeacherInSemester(id: number, data: any) {
        const availability = await this.teacherAvailabilityRepository.findById(id);
        if (!availability) {
            throw new AppError('No teacher availability found', 404, 'TEACHER_AVAILABILITY_NOT_FOUND');
        }

        const { maxPreThesis, maxThesis } = data;

        if (typeof maxPreThesis === 'number') {
            const currentPreThesisUsage = await PreThesis.count({
                where: {
                    supervisorTeacherId: availability.teacherId,
                    semesterId: availability.semesterId,
                    status: ['in_progress', 'completed']
                }
            });
            if (maxPreThesis < currentPreThesisUsage) {
                throw new AppError(
                    `Cannot set maxPreThesis (${maxPreThesis}) below current usage (${currentPreThesisUsage})`,
                    400,
                    'MAX_PRETHESIS_BELOW_USAGE'
                );
            }
            const sumMaxSlots = await Topic.sum('maxSlots', {
                where: {
                    teacherId: availability.teacherId,
                    semesterId: availability.semesterId,
                }
            });
            if (sumMaxSlots > maxPreThesis) {
                throw new AppError(
                    `Total topic slots (${sumMaxSlots}) exceed new maxPreThesis (${maxPreThesis})`,
                    400,
                    'TOPIC_SLOTS_EXCEED_MAX'
                );
            }
        }

        // Check maxThesis constraints
        if (typeof maxThesis === 'number') {
            const currentThesisUsage = await Thesis.count({
                where: {
                    supervisorTeacherId: availability.teacherId,
                    semesterId: availability.semesterId,
                    status: ['in_progress', 'defense_scheduled', 'defense_completed', 'completed']
                }
            });
            if (maxThesis < currentThesisUsage) {
                throw new AppError(
                    `Cannot set maxThesis (${maxThesis}) below current usage (${currentThesisUsage})`,
                    400,
                    'MAX_THESIS_BELOW_USAGE'
                );
            }
        }
        
        return this.teacherAvailabilityRepository.update(id, data);
    }

    async deleteTeacherFromSemester(id: number) {
        const availability = await this.teacherAvailabilityRepository.findById(id);
        if (!availability) {
            throw new AppError('No teacher availability found', 404, 'TEACHER_AVAILABILITY_NOT_FOUND');
        }

        // Check if teacher has supervised any PreThesis in this semester
        const preThesisCount = await PreThesis.count({
            where: {
                supervisorTeacherId: availability.teacherId,
                semesterId: availability.semesterId,
                status: ['in_progress', 'completed']
            }
        });

        // Check if teacher has supervised any Thesis in this semester
        const thesisCount = await Thesis.count({
            where: {
                supervisorTeacherId: availability.teacherId,
                semesterId: availability.semesterId,
                status: ['in_progress', 'defense_scheduled', 'defense_completed', 'completed']
            }
        });

        if (preThesisCount > 0 || thesisCount > 0) {
            throw new AppError(
                'Cannot delete teacher availability: teacher has supervised students in this semester.',
                400,
                'TEACHER_HAS_SUPERVISED_STUDENTS'
            );
        }

        return this.teacherAvailabilityRepository.delete(id);
    }

    async getTeacherAvailabilityInSemester(teacherId: number, semesterId: number) {
        const semester = await this.semesterRepository.findById(semesterId);
        if (!semester) {
            throw new AppError('No semester found', 404, 'SEMESTER_NOT_FOUND');
        }
        const availability = await this.teacherAvailabilityRepository.getTeacherSemester(teacherId, semesterId);
        if (!availability) {
            throw new AppError('Teacher not added to this semester', 404, 'TEACHER_AVAILABILITY_NOT_FOUND');
        }

        const result = {
            semester,
            availability
        };
        return result;
    }

    async getSemesterPopulationStats() {
        const semesters = await this.semesterRepository.findAll({}, 0, 4, [['startDate', 'DESC']]);
        
        const stats = await Promise.all(
            semesters.map(async (semester) => {
                const [studentCount, teacherCount] = await Promise.all([
                    StudentSemester.count({
                        where: {
                            semesterId: semester.id,
                            status: ['enrolled', 'completed']
                        }
                    }),
                    TeacherAvailability.count({
                        where: {
                            semesterId: semester.id
                        }
                    })
                ]);

                return {
                    semester: semester.name,
                    studentCount,
                    teacherCount
                };
            })
        );

        // Reverse to get oldest to newest order
        return stats.reverse();
    }
}