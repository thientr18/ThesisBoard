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

router.use('/announcements', announcementRouter);
router.use('/auth', authRoutes);
router.use('/attachments', attachmentsRouter);
router.use('/notifications', notificationRouter);
router.use('/pre-theses', preThesisRouter);
router.use('/semesters', semesterRouter);
router.use('/theses', thesisRouter);
router.use('/users', userRouter);

export default router;