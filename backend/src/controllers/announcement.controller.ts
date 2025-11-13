import { Request, Response, NextFunction } from 'express';
import { AnnouncementService } from '../services/announcement.service';
import { AnnouncementRepository } from '../repositories/announcement-repository';
import { AppError } from '../utils/AppError';

export class AnnouncementController {
  private announcementService: AnnouncementService;

  constructor() {
    const announcementRepository = new AnnouncementRepository();
    this.announcementService = new AnnouncementService(announcementRepository);
  }

  getAllAnnouncements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const announcements = await this.announcementService.getAllAnnouncements();
      res.status(200).json({ success: true, data: announcements });
    } catch (error) {
      next(error);
    }
  };

  getAnnouncementById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new AppError('Invalid announcement ID', 400, 'INVALID_ID');
      }
      
      const announcement = await this.announcementService.getAnnouncementById(id);
      res.status(200).json({ success: true, data: announcement });
    } catch (error) {
      next(error);
    }
  };

  createAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, content } = req.body;
      
      if (!title || !content) {
        throw new AppError('Title and content are required', 400, 'MISSING_FIELDS');
      }
// !!! userId in User table
      const userId = req.user?.sub || req.user?.id; 
      
      if (!userId) {
        throw new AppError('User ID not found in request', 401, 'USER_ID_NOT_FOUND');
      }
      
      const newAnnouncement = await this.announcementService.createAnnouncement({
        title,
        content,
        createdBy: userId
      });
      
      res.status(201).json({ success: true, data: newAnnouncement });
    } catch (error) {
      next(error);
    }
  };

  updateAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { title, content } = req.body;
      
      if (isNaN(id)) {
        throw new AppError('Invalid announcement ID', 400, 'INVALID_ID');
      }
      
      if (!title && !content) {
        throw new AppError('At least one field (title or content) must be provided for update', 400, 'MISSING_FIELDS');
      }
      
      const updatedAnnouncement = await this.announcementService.updateAnnouncement(id, {
        title,
        content
      });
      
      res.status(200).json({ success: true, data: updatedAnnouncement });
    } catch (error) {
      next(error);
    }
  };

  deleteAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new AppError('Invalid announcement ID', 400, 'INVALID_ID');
      }
      
      await this.announcementService.deleteAnnouncement(id);
      res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  getAnnouncementSlides = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      
      // Validate pagination parameters
      if (page < 1) {
        throw new AppError('Page number must be at least 1', 400, 'INVALID_PAGE');
      }
      
      if (limit < 1 || limit > 50) {
        throw new AppError('Limit must be between 1 and 50', 400, 'INVALID_LIMIT');
      }
      
      const result = await this.announcementService.getAnnouncementsBySlide(page, limit);
      
      res.status(200).json({
        success: true,
        data: result.announcements,
        pagination: {
          totalItems: result.totalItems,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          pageSize: result.pageSize
        }
      });
    } catch (error) {
      next(error);
    }
  };
}