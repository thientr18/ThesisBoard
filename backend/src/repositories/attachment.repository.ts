import { GenericRepository } from './generic.repository';
import { Attachment } from '../models/Attachment';
import { Op } from 'sequelize';

export class AttachmentRepository extends GenericRepository<Attachment, number> {
  constructor() {
    super(Attachment);
  }

  async findByEntity(
    entityType: Attachment['entityType'],
    entityId: number
  ): Promise<Attachment[]> {
    return this.model.findAll({
      where: {
        entityType,
        entityId
      }
    });
  }

  async findByUploader(userId: number): Promise<Attachment[]> {
    return this.model.findAll({
      where: {
        uploadedByUserId: userId
      }
    });
  }

  async findByMimeType(mimeType: string): Promise<Attachment[]> {
    return this.model.findAll({
      where: {
        mimeType: {
          [Op.like]: `${mimeType}%` // Allows searching for broad categories like "image/*"
        }
      }
    });
  }

  async findByFileName(fileName: string): Promise<Attachment[]> {
    return this.model.findAll({
      where: {
        fileName: {
          [Op.like]: `%${fileName}%`
        }
      }
    });
  }

  async countByEntity(
    entityType: Attachment['entityType'],
    entityId: number
  ): Promise<number> {
    return this.model.count({
      where: {
        entityType,
        entityId
      }
    });
  }

  async deleteByEntity(
    entityType: Attachment['entityType'],
    entityId: number
  ): Promise<number> {
    return this.model.destroy({
      where: {
        entityType,
        entityId
      }
    });
  }
}