import { Router } from 'express';
import attachmentsRouter from './attachments.routes';
import announcementRouter from './announcement.routes';

const router = Router();

router.use('/announcements', announcementRouter);
router.use('/attachments', attachmentsRouter);

export default router;