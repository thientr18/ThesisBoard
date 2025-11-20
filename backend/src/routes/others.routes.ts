import { Router } from 'express';
import { checkJwt } from '../middlewares/auth.middleware';
import { attachUserFromJwt } from '../middlewares/user.middleware';
import { allowedPermissions } from '../middlewares/permission.middleware';
import UserController from '../controllers/user.controller';

const userController = new UserController();

const router = Router();

router.use(checkJwt);
router.use(attachUserFromJwt);


export default router;