import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { AttachmentController } from '../controllers/AttachmentController';
import { upload } from '../config/multer';

const router = Router();
const attachmentController = new AttachmentController();

const handleAttachmentRequest = (req: Request, res: Response, next: NextFunction) => {
  const contentType = req.headers['content-type'] || '';
  
  if (contentType.includes('multipart/form-data')) {
    upload.array('files')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      attachmentController.uploadAttachment(req, res);
    });
  } else if (contentType.includes('application/json')) {
    attachmentController.createExternalAttachment(req, res);
  } else {
    res.status(415).json({ 
      error: 'Unsupported media type. Use multipart/form-data for file uploads or application/json for external links.' 
    });
  }
};

router.post('/', handleAttachmentRequest);
router.get('/:entityType/:entityId', attachmentController.getAttachmentsByEntity.bind(attachmentController));
router.delete('/:id', attachmentController.deleteAttachment.bind(attachmentController));

export default router;