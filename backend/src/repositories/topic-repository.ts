import { Op } from 'sequelize';
import { GenericRepository } from './generic-repository';
import { Topic } from '../models/Topic';

export class TopicRepository extends GenericRepository<Topic, number> {
  constructor() {
    super(Topic);
  }
  
  async findBySemesterId(semesterId: number): Promise<Topic[]> {
    return this.model.findAll({
      where: { semesterId }
    });
  }
  
  async findOpenTopicsBySemesterId(semesterId: number): Promise<Topic[]> {
    return this.model.findAll({
      where: { 
        semesterId,
        status: 'open'
      }
    });
  }
  
  async findByTeacherId(teacherId: number, semesterId?: number): Promise<Topic[]> {
    return this.model.findAll({
      where: semesterId 
        ? { teacherId, semesterId } 
        : { teacherId }
    });
  }
  
  /**
   * Count topics by teacher ID with optional semester filtering
   */
  async countByTeacherId(teacherId: number, semesterId?: number): Promise<number> {
    const whereCondition: any = { teacherId };
    
    if (semesterId) {
      whereCondition.semesterId = semesterId;
    }
    
    return this.model.count({ where: whereCondition });
  }
  
  async findByTeacherAndSemester(teacherId: number, semesterId: number): Promise<Topic[]> {
    return this.model.findAll({
      where: { teacherId, semesterId }
    });
  }

  /**
   * Search topics by title or description with optional semester filtering
   */
  async searchTopics(query: string, semesterId?: number): Promise<Topic[]> {
    const whereCondition: any = {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ]
    };
    
    if (semesterId) {
      whereCondition.semesterId = semesterId;
    }
    
    return this.model.findAll({ where: whereCondition });
  }
  
  /**
   * Find topics with available slots with optional semester filtering
   */
  async findWithAvailableSlots(semesterId?: number): Promise<Topic[]> {
    const whereCondition: any = {
      status: 'open',
      maxSlots: {
        [Op.ne]: null
      }
    };
    
    if (semesterId) {
      whereCondition.semesterId = semesterId;
    }
    
    return this.model.findAll({ where: whereCondition });
  }

  /**
   * Find topics by tag with optional semester filtering
   */
  async findByTag(tagName: string, semesterId?: number): Promise<Topic[]> {
    const whereCondition: any = {};
    
    if (semesterId) {
      whereCondition.semesterId = semesterId;
    }
    
    const topics = await this.model.findAll({ where: whereCondition });
    return topics.filter(topic => {
      if (!topic.tags) return false;
      return JSON.stringify(topic.tags).toLowerCase().includes(tagName.toLowerCase());
    });
  }
  
  /**
   * Count topics by status and semester
   */
  async countByStatusAndSemester(status: Topic['status'], semesterId: number): Promise<number> {
    return this.model.count({
      where: { status, semesterId }
    });
  }
  
  /**
   * Find topics by multiple filters
   */
  async findByFilters({
    teacherId,
    semesterId,
    status,
    hasAvailableSlots
  }: {
    teacherId?: number;
    semesterId?: number;
    status?: 'open' | 'closed';
    hasAvailableSlots?: boolean;
  }): Promise<Topic[]> {
    const whereCondition: any = {};
    
    if (teacherId) whereCondition.teacherId = teacherId;
    if (semesterId) whereCondition.semesterId = semesterId;
    if (status) whereCondition.status = status;
    if (hasAvailableSlots) {
      whereCondition.maxSlots = { [Op.ne]: null };
      whereCondition.status = 'open';
    }
    
    return this.model.findAll({ where: whereCondition });
  }
}