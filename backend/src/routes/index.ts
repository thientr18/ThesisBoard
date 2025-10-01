import { Router } from 'express';
import publicRoutes from './public.routes';
import protectedRoutes from './protected.routes';

const router = Router();

router.use('/', publicRoutes);
router.use('/', protectedRoutes);

export default router;