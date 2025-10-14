import { AnnouncementRepository } from '../repositories/announcement-repository';
import { Announcement } from '../models/Announcement';
import { AppError } from '../utils/AppError';

export class AnnouncementService {
  private announcementRepository: AnnouncementRepository;

  constructor(announcementRepository: AnnouncementRepository) {
    this.announcementRepository = announcementRepository;
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    try {
      return await this.announcementRepository.findAll({
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      throw new AppError('Failed to retrieve announcements', 500, 'FETCH_FAILED', error);
    }
  }

  async getAnnouncementById(id: number): Promise<Announcement> {
    try {
      const announcement = await this.announcementRepository.findById(id);
      
      if (!announcement) {
        throw new AppError('Announcement not found', 404, 'NOT_FOUND');
      }
      
      return announcement;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to retrieve announcement', 500, 'FETCH_FAILED', error);
    }
  }

  async createAnnouncement(announcementData: {
    title: string;
    content: string;
    createdBy: number;
  }): Promise<Announcement> {
    try {
      return await this.announcementRepository.create(announcementData);
    } catch (error) {
      throw new AppError('Failed to create announcement', 500, 'CREATE_FAILED', error);
    }
  }

  async updateAnnouncement(
    id: number,
    announcementData: {
      title?: string;
      content?: string;
    }
  ): Promise<Announcement> {
    try {
      const announcement = await this.announcementRepository.findById(id);
      
      if (!announcement) {
        throw new AppError('Announcement not found', 404, 'NOT_FOUND');
      }
      
      return await this.announcementRepository.update(id, announcementData) as Announcement;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update announcement', 500, 'UPDATE_FAILED', error);
    }
  }

  async deleteAnnouncement(id: number): Promise<void> {
    try {
      const announcement = await this.announcementRepository.findById(id);
      
      if (!announcement) {
        throw new AppError('Announcement not found', 404, 'NOT_FOUND');
      }
      
      await this.announcementRepository.delete(id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete announcement', 500, 'DELETE_FAILED', error);
    }
  }

  async getAnnouncementsBySlide(page: number = 1, limit: number = 5): Promise<{
    announcements: Announcement[],
    totalItems: number,
    totalPages: number,
    currentPage: number,
    pageSize: number
  }> {
    try {
      const result = await this.announcementRepository.findRecent(page, limit);
      
      return {
        announcements: result.announcements,
        totalItems: result.total,
        totalPages: result.totalPages,
        currentPage: result.page,
        pageSize: result.pageSize
      };
    } catch (error) {
      throw new AppError('Failed to retrieve announcement slides', 500, 'FETCH_FAILED', error);
    }
  }
}