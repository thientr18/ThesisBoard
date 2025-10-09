import { Router } from 'express';
import { checkJwt } from '../middlewares/authMiddleware';

import * as authController from '../controllers/AuthController';

const router = Router();

router.use(checkJwt);

// User profile endpoints
router.get('/me', authController.getCurrentUser);
router.patch('/me', authController.updateCurrentUser);

// Token verification
router.get('/verify', authController.verifyToken);

// Login callback for synchronization
router.post('/callback', authController.handleLoginCallback);

export default router;