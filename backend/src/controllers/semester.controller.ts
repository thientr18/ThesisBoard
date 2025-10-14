import { Request, Response } from 'express';
import { SemesterService } from '../services/semester.service';
import { Semester } from '../models/Semester';
import { AppError } from '../utils/AppError';

export class SemesterController {
    private semesterService: SemesterService;

    constructor() {
        this.semesterService = new SemesterService();
    }

    async getAllSemesters(req: Request, res: Response): Promise<void> {
        try {
            const semesters = await this.semesterService.getAllSemesters();
            res.status(200).json(semesters);
        } catch (error: any) {
            const appError = error instanceof AppError 
                ? error 
                : new AppError('Failed to retrieve semesters', 500, 'SEMESTER_FETCH_ERROR', error.message);
            
            res.status(appError.statusCode).json({
                status: appError.status,
                message: appError.message,
                code: appError.code,
                details: appError.details
            });
        }
    }

    async getSemesterById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                throw new AppError('Invalid semester ID', 400, 'INVALID_ID');
            }

            const semester = await this.semesterService.getSemesterById(id);
            if (!semester) {
                throw new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND');
            }

            res.status(200).json(semester);
        } catch (error: any) {
            const appError = error instanceof AppError 
                ? error 
                : new AppError('Failed to retrieve semester', 500, 'SEMESTER_FETCH_ERROR', error.message);
            
            res.status(appError.statusCode).json({
                status: appError.status,
                message: appError.message,
                code: appError.code,
                details: appError.details
            });
        }
    }

    async getActiveSemester(req: Request, res: Response): Promise<void> {
        try {
            const activeSemester = await this.semesterService.getActiveSemester();
            if (!activeSemester) {
                throw new AppError('No active semester found', 404, 'NO_ACTIVE_SEMESTER');
            }

            res.status(200).json(activeSemester);
        } catch (error: any) {
            const appError = error instanceof AppError 
                ? error 
                : new AppError('Failed to retrieve active semester', 500, 'SEMESTER_FETCH_ERROR', error.message);
            
            res.status(appError.statusCode).json({
                status: appError.status,
                message: appError.message,
                code: appError.code,
                details: appError.details
            });
        }
    }

    async createSemester(req: Request, res: Response): Promise<void> {
        try {
            const { code, name, startDate, endDate, isActive } = req.body;
            
            // Basic validation
            if (!code || !name || !startDate || !endDate) {
                throw new AppError('Missing required fields', 400, 'MISSING_FIELDS');
            }

            const newSemester = await this.semesterService.createSemester({
                code,
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive: isActive || false
            } as Semester);

            res.status(201).json(newSemester);
        } catch (error: any) {
            const appError = error instanceof AppError 
                ? error 
                : new AppError('Failed to create semester', 400, 'SEMESTER_CREATE_ERROR', error.message);
            
            res.status(appError.statusCode).json({
                status: appError.status,
                message: appError.message,
                code: appError.code,
                details: appError.details
            });
        }
    }

    async updateSemester(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                throw new AppError('Invalid semester ID', 400, 'INVALID_ID');
            }

            const { code, name, startDate, endDate, isActive } = req.body;
            const updateData: any = {};
            
            if (code !== undefined) updateData.code = code;
            if (name !== undefined) updateData.name = name;
            if (startDate !== undefined) updateData.startDate = new Date(startDate);
            if (endDate !== undefined) updateData.endDate = new Date(endDate);
            if (isActive !== undefined) updateData.isActive = isActive;

            const updatedSemester = await this.semesterService.updateSemester(id, updateData);
            if (!updatedSemester) {
                throw new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND');
            }

            res.status(200).json(updatedSemester);
        } catch (error: any) {
            const appError = error instanceof AppError 
                ? error 
                : new AppError('Failed to update semester', 400, 'SEMESTER_UPDATE_ERROR', error.message);
            
            res.status(appError.statusCode).json({
                status: appError.status,
                message: appError.message,
                code: appError.code,
                details: appError.details
            });
        }
    }

    async deleteSemester(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                throw new AppError('Invalid semester ID', 400, 'INVALID_ID');
            }

            await this.semesterService.deleteSemester(id);
            res.status(204).end();
        } catch (error: any) {
            const appError = error instanceof AppError 
                ? error 
                : error.message === 'Semester not found' 
                    ? new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND') 
                    : error.message === 'Cannot delete active semester' 
                        ? new AppError('Cannot delete active semester', 400, 'ACTIVE_SEMESTER_DELETE') 
                        : new AppError('Failed to delete semester', 500, 'SEMESTER_DELETE_ERROR', error.message);
            
            res.status(appError.statusCode).json({
                status: appError.status,
                message: appError.message,
                code: appError.code,
                details: appError.details
            });
        }
    }

    async activateSemester(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                throw new AppError('Invalid semester ID', 400, 'INVALID_ID');
            }

            await this.semesterService.activateSemester(id);
            res.status(200).json({ message: 'Semester activated successfully' });
        } catch (error: any) {
            const appError = error instanceof AppError 
                ? error 
                : error.message === 'Semester not found' 
                    ? new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND') 
                    : new AppError('Failed to activate semester', 500, 'SEMESTER_ACTIVATION_ERROR', error.message);
            
            res.status(appError.statusCode).json({
                status: appError.status,
                message: appError.message,
                code: appError.code,
                details: appError.details
            });
        }
    }

    async deactivateSemester(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                throw new AppError('Invalid semester ID', 400, 'INVALID_ID');
            }

            await this.semesterService.deactivateSemester(id);
            res.status(200).json({ message: 'Semester deactivated successfully' });
        } catch (error: any) {
            const appError = error instanceof AppError 
                ? error 
                : error.message === 'Semester not found' 
                    ? new AppError('Semester not found', 404, 'SEMESTER_NOT_FOUND') 
                    : new AppError('Failed to deactivate semester', 500, 'SEMESTER_DEACTIVATION_ERROR', error.message);
            
            res.status(appError.statusCode).json({
                status: appError.status,
                message: appError.message,
                code: appError.code,
                details: appError.details
            });
        }
    }
}