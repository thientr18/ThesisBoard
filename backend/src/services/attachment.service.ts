import { AttachmentRepository } from "../repositories/attachment.repository";
import { Attachment } from "../models/Attachment";
import { AppError } from "../utils/AppError";
import fs from "fs";
import path from "path";
import { th } from "zod/locales";

// Define valid entity types as a union type
export type EntityType = "topic" | "prethesis_submission" | "thesis_submission" | "announcement" | "topic_application" | "thesis_proposal" |  "thesis_registration" | "system" | "other";

export class AttachmentService {
  private attachmentRepository: AttachmentRepository;

  constructor() {
    this.attachmentRepository = new AttachmentRepository();
  }

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

      const filePath = path.join(process.cwd(), 'uploads', file.filename);
      if (!fs.existsSync(filePath)) {
        throw new AppError(`Uploaded file not found: ${file.filename}`, 500, 'FILE_NOT_FOUND');
      }
      
      const attachment = await this.attachmentRepository.create({
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
    const attachment = await this.attachmentRepository.create({
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

  public async getDownloadInfo(id: string): Promise<{ attachment: Attachment, filePath: string }> {
    const attachment = await this.attachmentRepository.findById(Number(id));
    if (!attachment) throw new AppError('Attachment not found', 404, 'NOT_FOUND');

    const filePath = path.join(process.cwd(), 'uploads', path.basename(attachment.fileUrl));
    if (!fs.existsSync(filePath)) throw new AppError('File not found', 404, 'FILE_NOT_FOUND');

    return { attachment, filePath };
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