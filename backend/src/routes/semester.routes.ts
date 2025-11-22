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

// Student-Semester routes
router.get("/student-semesters/student/:studentId",
    allowedPermissions(['view:semesters', 'admin:all', 'moderator:all', 'teacher:base']),
    semesterController.getSemesterForStudent
);
router.get("/student-semesters/semester/:semesterId",
    allowedPermissions(['view:semesters', 'admin:all', 'moderator:all', 'teacher:base']),
    semesterController.getStudentsInSemester
)
router.get("/student-semesters/:studentId/:semesterId",
    allowedPermissions(['manage:semesters', 'admin:all', 'moderator:all']),
    semesterController.getStudentSemester
);
router.post("/student-semesters/:semesterId",
    allowedPermissions(['manage:semesters', 'admin:all', 'moderator:all']),
    semesterController.createStudentInSemester
);
router.put("/student-semesters/:studentId/:semesterId",
    allowedPermissions(['manage:semesters', 'admin:all', 'moderator:all']),
    semesterController.updateStudentInSemester
)
router.delete("/student-semesters/:studentId/:semesterId",
    allowedPermissions(['manage:semesters', 'admin:all', 'moderator:all']),
    semesterController.deleteStudentFromSemester
);

// Teacher Availability routes
router.get("/teacher/:semesterId",
    allowedPermissions(['view:semesters', 'admin:all', 'moderator:all', 'teacher:base']),
    semesterController.getTeachersInSemester
);
router.post("/teacher/:semesterId",
    allowedPermissions(['manage:semesters', 'admin:all', 'moderator:all']),
    semesterController.createTeacherInSemester
);
router.put("/teacher/:semesterId/:teacherId",
    allowedPermissions(['manage:semesters', 'admin:all', 'moderator:all']),
    semesterController.updateTeacherInSemester
);
router.delete("/teacher/:semesterId/:teacherId",
    allowedPermissions(['manage:semesters', 'admin:all', 'moderator:all']),
    semesterController.deleteTeacherFromSemester
);

// Semester routes
router.post('/current/:id',
    allowedPermissions(['manage:semesters', 'admin:all', 'moderator:all']),
    semesterController.setCurrentSemester
);
router.patch('/unset-current/:id',
    allowedPermissions(['manage:semesters', 'admin:all', 'moderator:all']),
    semesterController.unsetCurrentSemester
);
router.get('/current',
    allowedPermissions(['view:semesters', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
    semesterController.getCurrentSemester
);
router.post('/active/:id',
    allowedPermissions(['manage:semesters', 'admin:all', 'moderator:all']),
    semesterController.setActiveSemester
);
router.patch('/unset-active/:id',
    allowedPermissions(['manage:semesters', 'admin:all', 'moderator:all']),
    semesterController.unsetActiveSemester
);
router.get('/active',
    allowedPermissions(['view:semesters', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']),
    semesterController.getActiveSemester
);
router.get('/:id',
    allowedPermissions(['view:semesters', 'admin:all', 'moderator:all']),
    semesterController.getSemesterById
);
router.put('/:id',
    allowedPermissions(['update:semesters', 'admin:all', 'moderator:all']),
    semesterController.updateSemester
);
router.delete('/:id',
    allowedPermissions(['delete:semesters', 'admin:all']),
    semesterController.deleteSemester
);
router.get('/',
    allowedPermissions(['view:semesters', 'admin:all', 'moderator:all']),
    semesterController.getAllSemesters
);
router.post('/',
    allowedPermissions(['create:semesters', 'admin:all', 'moderator:all']),
    semesterController.createSemester
);
export default router;