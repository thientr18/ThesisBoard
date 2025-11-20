import { NextFunction, Request, Response } from 'express';
import { SemesterService } from '../services/semester.service';
import { AppError } from '../utils/AppError';
import { parseExcelFile, validateRows, importStudentSemesters } from "../utils/student-semester.import.utils";
export class SemesterController {
    private semesterService: SemesterService;

    constructor() {
        this.semesterService = new SemesterService();
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

    importStudentSemestersHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                throw new AppError("No file uploaded", 400, "NO_FILE");
            }

            const rows = await parseExcelFile(req.file.path);
            const { validRows, errors } = validateRows(rows);

            if (errors.length > 0) {
                return res.status(400).json({
                    message: "Validation failed for some rows",
                    errors,
                });
            }

            const result = await importStudentSemesters(validRows);

            res.status(200).json(result);
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
            const { semesterId } = req.params;
            const semester = await this.semesterService.deleteSemester(Number(semesterId));
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
            const { semesterId } = req.params;
            const semester = await this.semesterService.setCurrentSemester(Number(semesterId));
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
            const { semesterId } = req.params;
            const semester = await this.semesterService.unsetCurrentSemester(Number(semesterId));
            if (!semester) {
                throw new AppError('No semester found to unset as current', 404, 'SEMESTER_NOT_FOUND');
            }
            res.json(semester);
        } catch (error) {
            next(error);
        }
    };

    getAtiveSemester = async (req: Request, res: Response, next: NextFunction) => {
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
            const { studentId } = req.params;
            const semesters = await this.semesterService.getStudentsInSemester(Number(studentId));
            if (!semesters || semesters.length === 0) {
                throw new AppError('No semesters found for the student', 404, 'STUDENT_SEMESTERS_NOT_FOUND');
            }
            res.json(semesters);
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
            const { teacherId } = req.params;
            const semesters = await this.semesterService.getTeachersInSemester(Number(teacherId));
            if (!semesters || semesters.length === 0) {
                throw new AppError('No semesters found for the teacher', 404, 'TEACHER_SEMESTERS_NOT_FOUND');
            }
            res.json(semesters);
        } catch (error) {
            next(error);
        }
    };
}