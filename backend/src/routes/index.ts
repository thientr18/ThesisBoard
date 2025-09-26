import { Router } from 'express';
import publicRoutes from './public.routes';
import protectedRoutes from './protected.routes';

const router = Router();

router.use('/api', publicRoutes);
router.use('/api', protectedRoutes);

export default router;