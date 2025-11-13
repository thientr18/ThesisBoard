import { Submission } from '../models/Submission';
import { GenericRepository } from './generic.repository';
import { Op } from 'sequelize';

export class SubmissionRepository extends GenericRepository<Submission, number> {
  constructor() {
    super(Submission);
  }

  async findByEntity(entityType: Submission['entityType'], entityId: number): Promise<Submission[]> {
    return this.findAll({
      entityType,
      entityId
    });
  }

  async findByType(type: Submission['type']): Promise<Submission[]> {
    return this.findAll({
      type
    });
  }
  
  async findByUploader(userId: number): Promise<Submission[]> {
    return this.findAll({
      uploadedByUserId: userId
    });
  }
  
  async findByEntityAndType(
    entityType: Submission['entityType'], 
    entityId: number,
    type: Submission['type']
  ): Promise<Submission[]> {
    return this.findAll({
      entityType,
      entityId,
      type
    });
  }
  
  async getLatestSubmissionByType(
    entityType: Submission['entityType'],
    entityId: number,
    type: 'report' | 'code' | 'demo' | 'other'
  ): Promise<Submission | null> {
    const submissions = await this.model.findAll({
      where: {
        entityType,
        entityId,
        type
      },
      order: [['createdAt', 'DESC']],
      limit: 1
    });
    
    return submissions.length > 0 ? submissions[0] : null;
  }
  
  async findByEntityAndDateRange(
    entityType: Submission['entityType'],
    entityId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Submission[]> {
    return this.model.findAll({
      where: {
        entityType,
        entityId,
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      } as any
    }) as Promise<Submission[]>;
  }
}