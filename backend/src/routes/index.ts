import { Router } from 'express';
import announcementRouter from './announcement.routes';
import attachmentsRouter from './attachments.routes';
import authRoutes from './auth.routes';
import notificationRouter from './notification.routes';
import preThesisRouter from './pre-thesis.routes';
import semesterRouter from './semester.routes';
import thesisRouter from './thesis.routes';
import userRouter from './user.routes';

const router = Router();

router.use('/api/announcements', announcementRouter);
router.use('/api/auth', authRoutes);
router.use('/api/attachments', attachmentsRouter);
router.use('/api/notifications', notificationRouter);
router.use('/api/pre-theses', preThesisRouter);
router.use('/api/semesters', semesterRouter);
router.use('/api/theses', thesisRouter);
router.use('/api/users', userRouter);

export default router;