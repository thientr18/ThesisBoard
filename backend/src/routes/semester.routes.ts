import express from 'express';
import { upload } from "../config/multer.config";
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
router.get('/current',
    allowedPermissions(['view:semesters', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
    semesterController.getCurrentSemester
);
router.post('/current/:id',
    allowedPermissions(['manage:semesters', 'admin:all', 'moderator:all']),
    semesterController.setCurrentSemester
);
router.patch('/unset-current/:id',
    allowedPermissions(['manage:semesters', 'admin:all', 'moderator:all']),
    semesterController.unsetCurrentSemester
);
router.get('/active',
    allowedPermissions(['view:semesters', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
    semesterController.getAtiveSemester
);
router.post('/active/:id',
    allowedPermissions(['manage:semesters', 'admin:all', 'moderator:all']),
    semesterController.setActiveSemester
);
router.patch('/unset-active/:id',
    allowedPermissions(['manage:semesters', 'admin:all', 'moderator:all']),
    semesterController.unsetActiveSemester
);

router.get("/student-semesters/:studentId",
    allowedPermissions(['view:semesters', 'admin:all', 'moderator:all', 'teacher:base']),
    semesterController.getSemesterForStudent
);

// Student in Semester Routes
router.post("/student-semesters/import", upload.single("file"), semesterController.importStudentSemestersHandler);

export default router;