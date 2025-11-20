import { Router } from 'express';
import { checkJwt } from '../middlewares/auth.middleware';
import { attachUserFromJwt } from '../middlewares/user.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { AuthController } from '../controllers/auth.controller';

const authController = new AuthController();

const router = Router();

router.use(checkJwt);
router.use(attachUserFromJwt);

// Token verification
router.get('/verify', authController.verifyToken);

export default router;