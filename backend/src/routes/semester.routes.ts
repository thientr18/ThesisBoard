import express from 'express';
import { SemesterController } from '../controllers/semester.controller';
import { checkJwt } from '../middlewares/auth.middleware';
import { attachUserFromJwt } from '../middlewares/user.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = express.Router();
const semesterController = new SemesterController();

router.use(checkJwt);
router.use(attachUserFromJwt);

router.get('/',
    roleMiddleware(['view:semesters', 'admin:all', 'moderator:all']),
    semesterController.getAllSemesters
);
router.get('/active',
    roleMiddleware(['view:semesters', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
    semesterController.getActiveSemester
);
router.get('/:id',
    roleMiddleware(['view:semesters', 'admin:all', 'moderator:all']),
    semesterController.getSemesterById
);
router.post('/',
    roleMiddleware(['create:semesters', 'admin:all', 'moderator:all']),
    semesterController.createSemester
);
router.put('/:id',
    roleMiddleware(['update:semesters', 'admin:all', 'moderator:all']),
    semesterController.updateSemester
);
router.delete('/:id',
    roleMiddleware(['delete:semesters', 'admin:all']),
    semesterController.deleteSemester
);
router.patch('/:id/activate',
    roleMiddleware(['update:semesters', 'admin:all', 'moderator:all']),
    semesterController.activateSemester
);
router.patch('/:id/deactivate',
    roleMiddleware(['update:semesters', 'admin:all', 'moderator:all']),
    semesterController.deactivateSemester
);

export default router;