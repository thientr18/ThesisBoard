import express from 'express';
import { SemesterController } from '../controllers/semester.controller';
import { checkJwt } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = express.Router();
const semesterController = new SemesterController();

// Bind controller methods to maintain 'this' context
const getAllSemesters = semesterController.getAllSemesters.bind(semesterController);
const getSemesterById = semesterController.getSemesterById.bind(semesterController);
const getActiveSemester = semesterController.getActiveSemester.bind(semesterController);
const createSemester = semesterController.createSemester.bind(semesterController);
const updateSemester = semesterController.updateSemester.bind(semesterController);
const deleteSemester = semesterController.deleteSemester.bind(semesterController);
const activateSemester = semesterController.activateSemester.bind(semesterController);
const deactivateSemester = semesterController.deactivateSemester.bind(semesterController);

router.use(checkJwt);

router.get('/', roleMiddleware(['view:semesters', 'admin:all', 'moderator:all']), getAllSemesters);
router.get('/active', roleMiddleware(['view:semesters', 'admin:all', 'moderator:all', 'teacher:base', 'student:pre_thesis', 'student:thesis']), getActiveSemester);
router.get('/:id', roleMiddleware(['view:semesters', 'admin:all', 'moderator:all']), getSemesterById);
router.post('/', roleMiddleware(['create:semesters', 'admin:all', 'moderator:all']), createSemester);
router.put('/:id', roleMiddleware(['update:semesters', 'admin:all', 'moderator:all']), updateSemester);
router.delete('/:id', roleMiddleware(['delete:semesters', 'admin:all']), deleteSemester);
router.patch('/:id/activate', roleMiddleware(['update:semesters', 'admin:all', 'moderator:all']), activateSemester);
router.patch('/:id/deactivate', roleMiddleware(['update:semesters', 'admin:all', 'moderator:all']), deactivateSemester);

export default router;