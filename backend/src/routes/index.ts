import { Router } from 'express';
import attachmentsRouter from './attachments.routes';
import announcementRouter from './announcement.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/api/auth', authRoutes);
router.use('/announcements', announcementRouter);
router.use('/attachments', attachmentsRouter);


export default router;