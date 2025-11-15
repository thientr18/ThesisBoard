import { AnnouncementRepository } from '../repositories/announcement.repository';
import { Announcement } from '../models/Announcement';
import { AppError } from '../utils/AppError';

export class AnnouncementService {
  private announcementRepository: AnnouncementRepository;

  constructor(announcementRepository: AnnouncementRepository) {
    this.announcementRepository = announcementRepository;
  }

  async getAllAnnouncements(offset: number = 0, limit?: number): Promise<Announcement[]> {
    try {
      return await this.announcementRepository.findAll(
        {},
        offset,
        limit,
        [['createdAt', 'DESC']]
      );
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

  async createAnnouncement(data: {
    title: string;
    content: string;
    pinned: boolean;
    publishedByUserId: number;
    audience: 'all' | 'students' | 'teachers' | 'public';
    visibleUntil?: Date | null;
    publishedAt?: Date;
  }): Promise<Announcement> {
    try {
      return await this.announcementRepository.create(data);
    } catch (error) {
      throw new AppError('Failed to create announcement', 500, 'CREATE_FAILED', error);
    }
  }

  async updateAnnouncement(
    id: number,
    announcementData: {
      title?: string;
      content?: string;
      audience?: 'all' | 'students' | 'teachers' | 'public';
      pinned?: boolean;
      publishedAt?: Date;
      visibleUntil?: Date | null;
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

  async getAnnouncementsBySlide(page: number = 1, limit: number = 5, offset: number = 0): Promise<{
    announcements: Announcement[],
    totalItems: number,
    totalPages: number,
    currentPage: number,
    pageSize: number
  }> {
    try {
      const result = await this.announcementRepository.findRecent(page, limit, offset);
      
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

  async getPinnedAnnouncements(page: number = 1, limit: number = 10, offset: number = 0): Promise<{
    announcements: Announcement[],
    totalItems: number,
    totalPages: number,
    currentPage: number,
    pageSize: number
  }> {
    try {
      const result = await this.announcementRepository.findPinned(page, limit, offset);
      
      return {
        announcements: result.announcements,
        totalItems: result.total,
        totalPages: result.totalPages,
        currentPage: result.page,
        pageSize: result.pageSize
      };
    } catch (error) {
      throw new AppError('Failed to retrieve pinned announcements', 500, 'FETCH_FAILED', error);
    }
  }

  // Statistics methods
  async getAnnouncementCount(): Promise<number> {
    try {
      return await this.announcementRepository.countAll();
    } catch (error) {
      throw new AppError('Failed to count announcements', 500, 'COUNT_FAILED', error);
    }
  }

  async getPinnedAnnouncementCount(): Promise<number> {
    try {
      return await this.announcementRepository.countPinned();
    } catch (error) {
      throw new AppError('Failed to count pinned announcements', 500, 'COUNT_FAILED', error);
    }
  }

  async getWeeklyAnnouncementCount(): Promise<number> {
    try {
      return await this.announcementRepository.countWeekly();
    } catch (error) {
      throw new AppError('Failed to count weekly announcements', 500, 'COUNT_FAILED', error);
    }
  }
}