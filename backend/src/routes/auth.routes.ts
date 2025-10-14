import { Router } from 'express';
import { checkJwt } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { AuthController } from '../controllers/auth.controller';

const authController = new AuthController();

const router = Router();

router.use(checkJwt);

router.get('/me', authController.getCurrentUser);
router.patch('/me', roleMiddleware(['update:users']), authController.updateCurrentUser);

// Token verification
router.get('/verify', authController.verifyToken);

// Login callback for synchronization
router.post('/callback', roleMiddleware(['manage:system_settings']), authController.handleLoginCallback);

export default router;