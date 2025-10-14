import { Request, Response, NextFunction } from 'express';
import { PreThesisService } from '../services/pre-thesis.service';
import { AppError } from '../utils/AppError';

export class PreThesisController {
  private preThesisService: PreThesisService;

  constructor() {
    this.preThesisService = new PreThesisService();
  }

  // Topic endpoints
  getTopics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { semesterId, tag, query, teacherId, status } = req.query;
      
      let topics;
      
      if (query) {
        topics = await this.preThesisService.searchTopics(query as string, Number(semesterId));
      } else if (tag) {
        topics = await this.preThesisService.getTopicsByTag(tag as string, Number(semesterId));
      } else if (teacherId) {
        topics = await this.preThesisService.getTeacherTopics(Number(teacherId), Number(semesterId));
      } else if (status === 'open' && semesterId) {
        topics = await this.preThesisService.getOpenTopicsByActiveSemester();
      } else {
        topics = await this.preThesisService.getOpenTopicsByActiveSemester();
      }
      
      res.status(200).json({
        status: 'success',
        data: topics
      });
    } catch (error) {
      next(error);
    }
  };

  getTopicById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const topic = await this.preThesisService.getTopicById(Number(req.params.id));
      if (!topic) {
        throw new AppError('Topic not found', 404, 'TOPIC_NOT_FOUND');
      }
      
      res.status(200).json({
        status: 'success',
        data: topic
      });
    } catch (error) {
      next(error);
    }
  };

  // Application endpoints
  applyToTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { topicId, studentId } = req.params;
      const { proposalTitle, proposalAbstract } = req.body;
      
      const application = await this.preThesisService.applyToTopic(
        Number(topicId),
        Number(studentId),
        { proposalTitle, proposalAbstract }
      );
      
      res.status(201).json({
        status: 'success',
        data: application
      });
    } catch (error) {
      next(error);
    }
  };

  getApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, topicId } = req.query;
      let applications;
      
      if (studentId) {
        const semesterId = req.query.semesterId ? Number(req.query.semesterId) : undefined;
        applications = await this.preThesisService.getApplicationsByStudent(Number(studentId), semesterId);
      } else if (topicId) {
        applications = await this.preThesisService.getApplicationsByTopic(Number(topicId));
      } else {
        throw new AppError('Please provide studentId or topicId', 400, 'MISSING_QUERY');
      }
      
      res.status(200).json({
        status: 'success',
        data: applications
      });
    } catch (error) {
      next(error);
    }
  };

  getApplicationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const application = await this.preThesisService.getApplicationById(Number(req.params.id));
      
      if (!application) {
        throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND');
      }
      
      res.status(200).json({
        status: 'success',
        data: application
      });
    } catch (error) {
      next(error);
    }
  };

  updateApplicationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, note } = req.body;
      const applicationId = Number(req.params.id);
      
      if (!['pending', 'accepted', 'rejected', 'cancelled'].includes(status)) {
        throw new AppError('Invalid status value', 400, 'INVALID_STATUS');
      }
      
      const application = await this.preThesisService.updateApplicationStatus(applicationId, status, note);
      
      res.status(200).json({
        status: 'success',
        data: application
      });
    } catch (error) {
      next(error);
    }
  };

  cancelApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { note } = req.body;
      const applicationId = Number(req.params.id);
      
      const application = await this.preThesisService.cancelApplication(applicationId, note);
      
      res.status(200).json({
        status: 'success',
        data: application
      });
    } catch (error) {
      next(error);
    }
  };

  // PreThesis endpoints
  getPreTheses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, supervisorId, semesterId, applicationId, status } = req.query;
      let preTheses;
      
      if (studentId) {
        preTheses = await this.preThesisService.getPreThesisByStudent(
          Number(studentId), 
          semesterId ? Number(semesterId) : undefined
        );
      } else if (supervisorId) {
        preTheses = await this.preThesisService.getPreThesisBySupervisor(
          Number(supervisorId), 
          semesterId ? Number(semesterId) : undefined
        );
      } else if (semesterId) {
        preTheses = await this.preThesisService.getPreThesisBySemester(Number(semesterId));
      } else if (applicationId) {
        const preThesis = await this.preThesisService.getPreThesisByTopicApplication(Number(applicationId));
        preTheses = preThesis ? [preThesis] : [];
      } else if (status === 'completed') {
        preTheses = await this.preThesisService.getCompletedPreTheses(
          semesterId ? Number(semesterId) : undefined
        );
      } else {
        throw new AppError('Please provide valid query parameters', 400, 'MISSING_QUERY');
      }
      
      res.status(200).json({
        status: 'success',
        data: preTheses
      });
    } catch (error) {
      next(error);
    }
  };

  getPreThesisById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const preThesis = await this.preThesisService.getPreThesisById(Number(req.params.id));
      
      if (!preThesis) {
        throw new AppError('Pre-thesis not found', 404, 'PRETHESIS_NOT_FOUND');
      }
      
      res.status(200).json({
        status: 'success',
        data: preThesis
      });
    } catch (error) {
      next(error);
    }
  };

  createPreThesis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, semesterId, supervisorTeacherId, topicApplicationId } = req.body;
      
      if (!studentId || !semesterId || !supervisorTeacherId) {
        throw new AppError('Missing required fields', 400, 'MISSING_FIELDS');
      }
      
      const preThesis = await this.preThesisService.createPreThesis(
        Number(studentId),
        Number(semesterId),
        Number(supervisorTeacherId),
        topicApplicationId ? Number(topicApplicationId) : undefined
      );
      
      res.status(201).json({
        status: 'success',
        data: preThesis
      });
    } catch (error) {
      next(error);
    }
  };

  updatePreThesisStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.body;
      const preThesisId = Number(req.params.id);
      
      if (!['in_progress', 'completed', 'cancelled'].includes(status)) {
        throw new AppError('Invalid status value', 400, 'INVALID_STATUS');
      }
      
      const preThesis = await this.preThesisService.updatePreThesisStatus(preThesisId, status);
      
      res.status(200).json({
        status: 'success',
        data: preThesis
      });
    } catch (error) {
      next(error);
    }
  };

  gradePreThesis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { finalScore } = req.body;
      const preThesisId = Number(req.params.id);
      
      if (finalScore === undefined || finalScore === null) {
        throw new AppError('Final score is required', 400, 'MISSING_FINAL_SCORE');
      }
      
      const preThesis = await this.preThesisService.gradePreThesis(preThesisId, Number(finalScore));
      
      res.status(200).json({
        status: 'success',
        data: preThesis
      });
    } catch (error) {
      next(error);
    }
  };

  cancelPreThesis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const preThesisId = Number(req.params.id);
      
      const preThesis = await this.preThesisService.cancelPreThesis(preThesisId);
      
      res.status(200).json({
        status: 'success',
        data: preThesis
      });
    } catch (error) {
      next(error);
    }
  };

  // Statistics endpoints
  getPreThesisStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { semesterId } = req.params;
      
      if (!semesterId) {
        throw new AppError('Semester ID is required', 400, 'MISSING_SEMESTER_ID');
      }
      
      const stats = await this.preThesisService.getPreThesisCountByStatus(Number(semesterId));
      
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  getApplicationStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { semesterId } = req.params;
      
      if (!semesterId) {
        throw new AppError('Semester ID is required', 400, 'MISSING_SEMESTER_ID');
      }
      
      const stats = await this.preThesisService.getApplicationStatsBySemester(Number(semesterId));
      
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };
}