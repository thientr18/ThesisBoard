import { Attachment } from "../models/Attachment";
import { Request, Response } from "express";
import { AttachmentService, EntityType } from "../services/AttachmentService";

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
    return ["topic", "submission", "announcement", "topic_application", "thesis_proposal"].includes(entityType);
  }

  /**
   * Upload file(s) and save attachment record(s) in the database
   */
  public async uploadAttachment(req: MulterRequest, res: Response): Promise<void> {
    try {
      const { entityType, entityId, uploadedByUserId } = req.body;
      
      if (!entityType || !entityId || !uploadedByUserId) {
        res.status(400).json({ error: 'Missing required fields: entityType, entityId, or uploadedByUserId' });
        return;
      }

      if (!this.isValidEntityType(entityType)) {
        res.status(400).json({ error: 'Invalid entityType. Valid values are: topic, submission, announcement, topic_application, thesis_proposal' });
        return;
      }

      if (!req.files && !req.file) {
        res.status(400).json({ error: 'No files were uploaded' });
        return;
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
      console.error('Error uploading attachment:', error);
      res.status(500).json({ error: 'Failed to upload attachment' });
    }
  }

  public async createExternalAttachment(req: Request, res: Response): Promise<void> {
    try {
      const { entityType, entityId, uploadedByUserId, fileUrl, fileName, mimeType } = req.body;
      
      if (!entityType || !entityId || !uploadedByUserId || !fileUrl) {
        res.status(400).json({ 
          error: 'Missing required fields: entityType, entityId, uploadedByUserId, or fileUrl' 
        });
        return;
      }

      if (!this.isValidEntityType(entityType)) {
        res.status(400).json({ error: 'Invalid entityType. Valid values are: topic, submission, announcement, topic_application, thesis_proposal' });
        return;
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
      console.error('Error creating external attachment:', error);
      res.status(500).json({ error: 'Failed to create external attachment' });
    }
  }
  public async getAttachmentsByEntity(req: Request, res: Response): Promise<void> {
    try {
      const { entityType, entityId } = req.params;

      if (!this.isValidEntityType(entityType)) {
        res.status(400).json({ error: 'Invalid entityType. Valid values are: topic, submission, announcement, topic_application, thesis_proposal' });
        return;
      }

      const attachments = await this.attachmentService.getByEntity(
        entityType as EntityType,
        Number(entityId)
      );

      res.status(200).json(attachments);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      res.status(500).json({ error: 'Failed to fetch attachments' });
    }
  }

  public async deleteAttachment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      await this.attachmentService.delete(id);

      res.status(200).json({ message: 'Attachment deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Attachment not found') {
        res.status(404).json({ error: 'Attachment not found' });
        return;
      }
      console.error('Error deleting attachment:', error);
      res.status(500).json({ error: 'Failed to delete attachment' });
    }
  }
}