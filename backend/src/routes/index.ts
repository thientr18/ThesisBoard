import { Router } from 'express';
import publicRoutes from './public.routes';
import protectedRoutes from './protected.routes';
import attachmentsRouter from './attachments.routes';

const router = Router();

router.use('/', publicRoutes);
router.use('/', protectedRoutes);
router.use('/attachments', attachmentsRouter);

export default router;