import { NextFunction, Request, Response } from 'express';
import { SemesterService } from '../services/semester.service';
import { AppError } from '../utils/AppError';
import { UserService } from '../services/user.service';
export class SemesterController {
    private semesterService: SemesterService;
    private userService: UserService;

    constructor() {
        this.semesterService = new SemesterService();
        this.userService = new UserService();
    }

    getAllSemesters = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const semesters = await this.semesterService.getAllSemesters();
            if (!semesters || semesters.length === 0) {
                throw new AppError('No semesters found', 404, 'SEMESTERS_NOT_FOUND');
            }
            res.json(semesters);
        } catch (error) {
            next(error);
        }
    };

    getSemesterById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const semester = await this.semesterService.getSemesterById(Number(id));
            if (!semester) {
                throw new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND');
            }   
            res.json(semester);
        } catch (error) {
            next(error);
        }
    };

    createSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const semester = await this.semesterService.createSemester(data);
            if (!semester) {
                throw new AppError('Failed to create semester', 500, 'SEMESTER_CREATION_FAILED');
            }
            res.status(201).json(semester);
        } catch (error) {
            next(error);
        }
    };

    updateSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const data = req.body;
            const semester = await this.semesterService.updateSemester(Number(id), data);
            if (!semester) {
                throw new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND');
            }
            res.json(semester);
        } catch (error) {
            next(error);
        }
    };

    deleteSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const semester = await this.semesterService.deleteSemester(Number(id));
            if (!semester) {
                throw new AppError('No semester found to delete', 404, 'SEMESTER_NOT_FOUND');
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    getCurrentSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const semester = await this.semesterService.getCurrentSemester();
            if (!semester) {
                throw new AppError('No current semester found', 404, 'CURRENT_SEMESTER_NOT_FOUND');
            }
            res.json(semester);
        } catch (error) {
            next(error);
        }
    };

    setCurrentSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const semester = await this.semesterService.setCurrentSemester(Number(id));
            if (!semester) {
                throw new AppError('No semester found to set as current', 404, 'SEMESTER_NOT_FOUND');
            }
            res.json(semester);
        } catch (error) {
            next(error);
        }
    };

    unsetCurrentSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const semester = await this.semesterService.unsetCurrentSemester(Number(id));
            if (!semester) {
                throw new AppError('No semester found to unset as current', 404, 'SEMESTER_NOT_FOUND');
            }
            res.json(semester);
        } catch (error) {
            next(error);
        }
    };

    getActiveSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const semester = await this.semesterService.getActiveSemester();
            if (!semester) {
                throw new AppError('No active semester found', 404, 'ACTIVE_SEMESTER_NOT_FOUND');
            }
            res.json(semester);
        } catch (error) {
            next(error);
        }
    };

    setActiveSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { semesterId } = req.params;
            const semester = await this.semesterService.setActiveSemester(Number(semesterId));
            if (!semester) {
                throw new AppError('No semester found to activate', 404, 'SEMESTER_NOT_FOUND');
            }
            res.json(semester);
        } catch (error) {
            next(error);
        }
    };

    unsetActiveSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { semesterId } = req.params;
            const semester = await this.semesterService.unsetActiveSemester(Number(semesterId));
            if (!semester) {
                throw new AppError('No semester found to deactivate', 404, 'SEMESTER_NOT_FOUND');
            }
            res.json(semester);
        } catch (error) {
            next(error);
        }
    };

    // Student in Semester Controllers
    getStudentsInSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { semesterId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 15;
            const search = req.query.search as string | undefined;
            const studentCode = req.query.studentCode as string | undefined;
            const status = req.query.status as string | undefined;
            const type = req.query.type as string | undefined;
            const result = await this.semesterService.getStudentsInSemester(
                Number(semesterId),
                page,
                pageSize,
                search,
                studentCode,
                status,
                type
            );
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    getSemesterForStudent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { studentId } = req.params;
            const semesters = await this.semesterService.getStudentSemesters(Number(studentId));

            res.json(semesters);
        } catch (error) {
            next(error);
        }
    };

    getStudentSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('getStudentSemester called with params:', req.params);
            const { studentId, semesterId } = req.params;
            const semesters = await this.semesterService.getStudentSemester(Number(studentId), Number(semesterId));
            if (!semesters || semesters.length === 0) {
                throw new AppError('No semesters found for the student', 404, 'STUDENT_SEMESTERS_NOT_FOUND');
            }
            res.json(semesters);
        } catch (error) {
            next(error);
        }
    };

    createStudentInSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { studentId, semesterId, gpa, credits, type, status } = req.body;
            const data = { studentId, semesterId, gpa, credits, type, status };
            const createdStudentSemester = await this.semesterService.addStudentToSemester(data);
            res.status(201).json(createdStudentSemester);
        } catch (error) {
            next(error);
        }
    };

    updateStudentInSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { studentId, semesterId } = req.params;
            const { gpa, credits, type, status } = req.body;
            console.log('updateStudentInSemester called with params:', req.params, 'and body:', req.body);
            const studentSemester = await this.semesterService.getStudentSemester(Number(studentId), Number(semesterId));
            if (!studentSemester) {
                throw new AppError('No semester found for the student', 404, 'STUDENT_SEMESTER_NOT_FOUND');
            }

            const updatedSemester = await this.semesterService.updateStudentInSemester(studentSemester.id, { gpa, credits, type, status });
            res.json(updatedSemester);
        } catch (error) {
            next(error);
        }
    };

    deleteStudentFromSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { studentId, semesterId } = req.params;
            const studentSemester = await this.semesterService.getStudentSemester(Number(studentId), Number(semesterId));
            if (!studentSemester) {
                throw new AppError('No semester found for the student', 404, 'STUDENT_SEMESTER_NOT_FOUND');
            }

            await this.semesterService.deleteStudentFromSemester(studentSemester.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    // Teacher in Semester Controllers
    getTeachersInSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('getTeachersInSemester called with params:', req.params);
            const { semesterId } = req.params;
            const semesters = await this.semesterService.getTeachersInSemester(Number(semesterId));

            res.json(semesters);
        } catch (error) {
            next(error);
        }
    };

    createTeacherInSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { semesterId } = req.params;
            const { teacherId, maxPreThesis, maxThesis, isOpen, note } = req.body;
            const data = { teacherId, semesterId, maxPreThesis, maxThesis, isOpen, note };
            const createdTeacherSemester = await this.semesterService.addTeacherToSemester(data);
            res.status(201).json(createdTeacherSemester);
        } catch (error) {
            next(error);
        }
    };

    updateTeacherInSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { teacherId, semesterId } = req.params;
            console.log('updateTeacherInSemester called with params:', req.params, 'and body:', req.body);
            const { maxPreThesis, maxThesis, isOpen, note } = req.body;
            const teacherSemester = await this.semesterService.getTeacherSemester(Number(teacherId), Number(semesterId));
            if (!teacherSemester) {
                throw new AppError('No semester found for the teacher', 404, 'TEACHER_SEMESTER_NOT_FOUND');
            }
            const updatedSemester = await this.semesterService.updateTeacherInSemester(teacherSemester.id, { maxPreThesis, maxThesis, isOpen, note });
            res.json(updatedSemester);
        } catch (error) {
            next(error);
        }
    };

    deleteTeacherFromSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { teacherId, semesterId } = req.params;
            console.log('deleteTeacherFromSemester called with params:', req.params);
            const teacherSemester = await this.semesterService.getTeacherSemester(Number(teacherId), Number(semesterId));
            if (!teacherSemester) {
                throw new AppError('No semester found for the teacher', 404, 'TEACHER_SEMESTER_NOT_FOUND');
            }

            await this.semesterService.deleteTeacherFromSemester(teacherSemester.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
    getOwnTeacherAvailabilityInActiveSemester = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('User ID not found in request', 400, 'USER_ID_NOT_FOUND');
            }
            const teacherId = await this.userService.getTeacherIdByUserId(Number(userId));
            if (!teacherId) {
                throw new AppError('No teacher found for the user', 404, 'TEACHER_NOT_FOUND');
            }
            const activeSemester = await this.semesterService.getActiveSemester();
            if (!activeSemester) {
                throw new AppError('No active semester found', 404, 'ACTIVE_SEMESTER_NOT_FOUND');
            }
            const availability = await this.semesterService.getTeacherAvailabilityInSemester(Number(teacherId), activeSemester.id);
            if (!availability) {
                throw new AppError('No availability found for the teacher in the semester', 404, 'TEACHER_AVAILABILITY_NOT_FOUND');
            }
            res.json(availability);
        } catch (error) {
            next(error);
        }
    };

    getSemesterPopulationStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await this.semesterService.getSemesterPopulationStats();
            res.json(stats);
        } catch (error) {
            next(error);
        }
    };
}