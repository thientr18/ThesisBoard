import { Request, Response, NextFunction } from 'express';
import { AnnouncementService } from '../services/announcement.service';
import { AnnouncementRepository } from '../repositories/announcement.repository';
import { AppError } from '../utils/AppError';

interface Announcement {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  audience: string;
  audienceFilter?: string;
  visibleUntil?: Date;
  publishedAt?: Date;
  publishedByUserId: number;
}
export class AnnouncementController {
  private announcementService: AnnouncementService;

  constructor() {
    const announcementRepository = new AnnouncementRepository();
    this.announcementService = new AnnouncementService(announcementRepository);
  }

  getAllAnnouncements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      if (offset < 0) {
        throw new AppError('Offset must be at least 0', 400, 'INVALID_OFFSET');
      }

      if (limit !== undefined && (limit < 1 || limit > 100)) {
        throw new AppError('Limit must be between 1 and 100', 400, 'INVALID_LIMIT');
      }

      const announcements = await this.announcementService.getAllAnnouncements(offset, limit);
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
      const userId = (req as any).user.id;

      const { title, content, pinned, audience, visibleUntil, publishedAt } = req.body;
      if (!title || !content) {
        throw new AppError('Title and content are required', 400, 'MISSING_FIELDS');
      }
      
      const newAnnouncement = await this.announcementService.createAnnouncement({
        title,
        content,
        pinned,
        audience,
        visibleUntil,
        publishedAt,
        publishedByUserId: userId
      });
      
      res.status(201).json({ success: true, data: newAnnouncement });
    } catch (error) {
      next(error);
    }
  };

  updateAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("Update Announcement");
      const id = parseInt(req.params.id);

      const { title, content, pinned, audience, visibleUntil, publishedAt } = req.body;
      
      if (isNaN(id)) {
        throw new AppError('Invalid announcement ID', 400, 'INVALID_ID');
      }
      
      const updatedAnnouncement = await this.announcementService.updateAnnouncement(id, {
        title,
        content,
        pinned,
        audience,
        visibleUntil,
        publishedAt
      });
      
      res.status(200).json({ success: true, data: updatedAnnouncement });
    } catch (error) {
      next(error);
    }
  };

  deleteAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("Delete Announcement");
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
      const offset = parseInt(req.query.offset as string) || 0;
      
      // Validate pagination parameters
      if (page < 1) {
        throw new AppError('Page number must be at least 1', 400, 'INVALID_PAGE');
      }
      
      if (limit < 1 || limit > 50) {
        throw new AppError('Limit must be between 1 and 50', 400, 'INVALID_LIMIT');
      }

      if (offset < 0) {
        throw new AppError('Offset must be at least 0', 400, 'INVALID_OFFSET');
      }
      
      const result = await this.announcementService.getAnnouncementsBySlide(page, limit, offset);
      
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

  getPinnedAnnouncements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      // Validate pagination parameters
      if (page < 1) {
        throw new AppError('Page number must be at least 1', 400, 'INVALID_PAGE');
      }
      
      if (limit < 1 || limit > 50) {
        throw new AppError('Limit must be between 1 and 50', 400, 'INVALID_LIMIT');
      }

      if (offset < 0) {
        throw new AppError('Offset must be at least 0', 400, 'INVALID_OFFSET');
      }
      
      const result = await this.announcementService.getPinnedAnnouncements(page, limit, offset);
      
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

  // Statistics
  getAnnouncementCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this.announcementService.getAnnouncementCount();
      res.status(200).json({ success: true, data: count });
    } catch (error) {
      next(error);
    }
  };

  getPinnedAnnouncementCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this.announcementService.getPinnedAnnouncementCount();
      res.status(200).json({ success: true, data: count });
    } catch (error) {
      next(error);
    }
  };

  getWeeklyAnnouncementCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this.announcementService.getWeeklyAnnouncementCount();
      res.status(200).json({ success: true, data: count });
    } catch (error) {
      next(error);
    }
  };
}