import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { roleMiddleware } from '../middlewares/role.middleware';
import { checkJwt } from '../middlewares/auth.middleware';
import { AttachmentController } from '../controllers/attachment.controller';
import { upload } from '../config/multer.config';
import { AppError } from '../utils/AppError';

const router = Router();
router.use(checkJwt);

const attachmentController = new AttachmentController();

const handleAttachmentRequest = (req: Request, res: Response, next: NextFunction) => {
  const contentType = req.headers['content-type'] || '';
  
  if (contentType.includes('multipart/form-data')) {
    upload.array('files')(req, res, (err) => {
      if (err) {
        return next(new AppError(err.message, 400, 'BAD_REQUEST'));
      }
      attachmentController.uploadAttachment(req, res, next);
    });
  } else if (contentType.includes('application/json')) {
    attachmentController.createExternalAttachment(req, res, next);
  } else {
    return next(
      new AppError(
        'Unsupported media type. Use multipart/form-data for file uploads or application/json for external links.',
        415, 
        'UNSUPPORTED_MEDIA_TYPE'
      )
    );
  }
};

// Routes
router.post('/',
  roleMiddleware(['upload:attachments']),
  handleAttachmentRequest);
  
router.get('/:entityType/:entityId',
  roleMiddleware(['download:attachments']),
  attachmentController.getAttachmentsByEntity.bind(attachmentController));
  
router.delete('/:id',
  roleMiddleware(['delete:attachments']),
  attachmentController.deleteAttachment.bind(attachmentController));

export default router;