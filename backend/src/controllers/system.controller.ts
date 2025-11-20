import { Request, Response, NextFunction } from 'express';
import { SystemService } from '../services/system.service';
import { AppError } from '../utils/AppError';

export class SystemController {
    private systemService: SystemService;

    constructor() {
        this.systemService = new SystemService();
    }

}