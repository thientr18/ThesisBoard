import { Router } from "express";
import { SystemController } from "../controllers/system.controller";
import { checkJwt } from "../middlewares/auth.middleware";
import { allowedPermissions } from "../middlewares/permission.middleware";  
import { attachUserFromJwt } from "../middlewares/user.middleware";

const router = Router();
const systemController = new SystemController();

router.use(checkJwt);
router.use(attachUserFromJwt);


export default router;