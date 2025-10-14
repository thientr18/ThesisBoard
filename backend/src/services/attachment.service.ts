import { Attachment } from "../models/Attachment";
import { AppError } from "../utils/AppError";
import fs from "fs";
import path from "path";

// Define valid entity types as a union type
export type EntityType = "topic" | "submission" | "announcement" | "topic_application" | "thesis_proposal";

export class AttachmentService {
  /**
   * Create attachment records for uploaded files (with multer)
   */
  public async createFromUploadedFiles(
    files: Express.Multer.File[],
    entityType: EntityType,
    entityId: number,
    uploadedByUserId: number
  ): Promise<Attachment[]> {
    const attachments: Attachment[] = [];

    for (const file of files) {
      const fileUrl = `/uploads/${file.filename}`;
      
      const attachment = await Attachment.create({
        entityType,
        entityId,
        fileUrl,
        fileName: file.originalname,
        mimeType: file.mimetype,
        uploadedByUserId
      });

      attachments.push(attachment);
    }

    return attachments;
  }

  /**
   * Create attachment record with external URL
   */
  public async createFromExternalUrl(
    fileUrl: string,
    fileName: string,
    mimeType: string | null,
    entityType: EntityType,
    entityId: number,
    uploadedByUserId: number
  ): Promise<Attachment> {
    const attachment = await Attachment.create({
      entityType,
      entityId,
      fileUrl,
      fileName: fileName || 'External file',
      mimeType: mimeType || 'application/octet-stream',
      uploadedByUserId
    });

    return attachment;
  }

  /**
   * Get all attachments for a specific entity
   */
  public async getByEntity(
    entityType: EntityType,
    entityId: number
  ): Promise<Attachment[]> {
    return await Attachment.findAll({
      where: {
        entityType,
        entityId
      }
    });
  }

  /**
   * Delete attachment by ID
   * Handles both uploaded files and external URLs
   */
  public async delete(id: string): Promise<void> {
    const attachment = await Attachment.findByPk(id);
    
    if (!attachment) {
      throw new AppError('Attachment not found', 404, 'NOT_FOUND');
    }

    // Check if it's a local file (not an external URL)
    if (attachment.fileUrl.startsWith('/uploads/')) {
      // Delete the physical file
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const fileName = attachment.fileUrl.replace('/uploads/', '');
      const filePath = path.join(uploadsDir, fileName);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await attachment.destroy();
  }
}