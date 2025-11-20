import { Attachment } from "../models/Attachment";
import { Request, Response, NextFunction } from "express";
import { AttachmentService, EntityType } from "../services/attachment.service";
import { AppError } from "../utils/AppError";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

export class AttachmentController {
  private attachmentService: AttachmentService;

  constructor() {
    this.attachmentService = new AttachmentService();
  }
  
  private isValidEntityType(entityType: string): entityType is EntityType {
    return ["topic", "submission", "announcement", "topic_application", "thesis_proposal", "system", "other"].includes(entityType);
  }

  /**
   * Upload file(s) and save attachment record(s) in the database
   */
  public async uploadAttachment(req: MulterRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { entityType, entityId, uploadedByUserId } = req.body;
      
      if (!entityType || !entityId || !uploadedByUserId) {
        return next(new AppError('Missing required fields: entityType, entityId, or uploadedByUserId', 400, 'MISSING_FIELDS'));
      }

      if (!this.isValidEntityType(entityType)) {
        return next(new AppError('Invalid entityType. Valid values are: topic, submission, announcement, topic_application, thesis_proposal', 400, 'INVALID_ENTITY_TYPE'));
      }

      if (!req.files && !req.file) {
        return next(new AppError('No files were uploaded', 400, 'NO_FILES'));
      }

      // Normalize files to array format regardless of how multer provides them
      let filesArray: Express.Multer.File[] = [];
      
      if (req.file) {
        filesArray = [req.file];
      } else if (req.files) {
        if (Array.isArray(req.files)) {
          filesArray = req.files;
        } else {
          // Object format, flatten all file arrays
          filesArray = Object.values(req.files).flat();
        }
      }
        
      const attachments = await this.attachmentService.createFromUploadedFiles(
        filesArray,
        entityType as EntityType,
        Number(entityId),
        Number(uploadedByUserId)
      );

      res.status(201).json(attachments);
    } catch (error) {
      next(new AppError('Failed to upload attachment', 500, 'UPLOAD_FAILED', error));
    }
  }

  public async createExternalAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { entityType, entityId, uploadedByUserId, fileUrl, fileName, mimeType } = req.body;
      
      if (!entityType || !entityId || !uploadedByUserId || !fileUrl) {
        return next(new AppError('Missing required fields: entityType, entityId, uploadedByUserId, or fileUrl', 400, 'MISSING_FIELDS')); 
      }

      if (!this.isValidEntityType(entityType)) {
        return next(new AppError('Invalid entityType. Valid values are: topic, submission, announcement, topic_application, thesis_proposal', 400, 'INVALID_ENTITY_TYPE'));
      }

      const attachment = await this.attachmentService.createFromExternalUrl(
        fileUrl,
        fileName || 'External file',
        mimeType,
        entityType as EntityType,
        Number(entityId),
        Number(uploadedByUserId)
      );

      res.status(201).json(attachment);
    } catch (error) {
      next(new AppError('Failed to create external attachment', 500, 'EXTERNAL_UPLOAD_FAILED', error));
    }
  }

  public async getAttachmentsByEntity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { entityType, entityId } = req.params;

      if (!this.isValidEntityType(entityType)) {
        return next(new AppError('Invalid entityType. Valid values are: topic, submission, announcement, topic_application, thesis_proposal', 400, 'INVALID_ENTITY_TYPE'));
      }

      const attachments = await this.attachmentService.getByEntity(
        entityType as EntityType,
        Number(entityId)
      );

      res.status(200).json(attachments);
    } catch (error) {
      next(new AppError('Failed to fetch attachments', 500, 'FETCH_FAILED', error));
    }
  }

  public async deleteAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      await this.attachmentService.delete(id);

      res.status(200).json({ message: 'Attachment deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Attachment not found') {
        return next(new AppError('Attachment not found', 404, 'NOT_FOUND'));
      }
      next(new AppError('Failed to delete attachment', 500, 'DELETE_FAILED', error));
    }
  }
}