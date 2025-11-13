import express from 'express';
import { SemesterController } from '../controllers/semester.controller';
import { checkJwt } from '../middlewares/auth.middleware';
import { attachUserFromJwt } from '../middlewares/user.middleware';
import { allowedPermissions } from '../middlewares/permission.middleware';

const router = express.Router();
const semesterController = new SemesterController();

router.use(checkJwt);
router.use(attachUserFromJwt);

router.get('/',
    allowedPermissions(['view:semesters', 'admin:all', 'moderator:all']),
    semesterController.getAllSemesters
);
router.get('/active',
    allowedPermissions(['view:semesters', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
    semesterController.getActiveSemester
);
router.get('/:id',
    allowedPermissions(['view:semesters', 'admin:all', 'moderator:all']),
    semesterController.getSemesterById
);
router.post('/',
    allowedPermissions(['create:semesters', 'admin:all', 'moderator:all']),
    semesterController.createSemester
);
router.put('/:id',
    allowedPermissions(['update:semesters', 'admin:all', 'moderator:all']),
    semesterController.updateSemester
);
router.delete('/:id',
    allowedPermissions(['delete:semesters', 'admin:all']),
    semesterController.deleteSemester
);
router.patch('/:id/activate',
    allowedPermissions(['update:semesters', 'admin:all', 'moderator:all']),
    semesterController.activateSemester
);
router.patch('/:id/deactivate',
    allowedPermissions(['update:semesters', 'admin:all', 'moderator:all']),
    semesterController.deactivateSemester
);

export default router;