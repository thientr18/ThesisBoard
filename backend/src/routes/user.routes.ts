import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { checkJwt } from '../middlewares/auth.middleware';
import { allowedPermissions } from '../middlewares/permission.middleware';
import { attachUserFromJwt } from '../middlewares/user.middleware';

const router = Router();
const userController = new UserController();

router.use(checkJwt);
router.use(attachUserFromJwt);

// Role management
router.post('/roles', allowedPermissions(['admin:all', 'manage:roles']), userController.assignRoleToUser);
router.delete('/roles', allowedPermissions(['admin:all', 'manage:roles']), userController.removeRoleFromUser);

// User listing and search
router.get('/me', userController.getCurrentUserProfile);
router.put('/change-password', userController.changeOwnPassword);
router.get('/search', allowedPermissions(['admin:all', 'moderator:all', 'read:users']), userController.searchUsers);
router.get('/statistics', allowedPermissions(['admin:all', 'access:admin_dashboard', 'view:logs']), userController.getUserStatistics);

// Student-specific operations
router.post('/student', allowedPermissions(['admin:all', 'moderator:all']), userController.createStudent);
router.get('/students', allowedPermissions(['admin:all', 'moderator:all', 'read:users']), userController.getAllStudents);
router.get('/student/:studentId', allowedPermissions(['admin:all', 'moderator:all', 'read:users']), userController.getStudentById);
router.put('/student/:studentId', allowedPermissions(['admin:all', 'moderator:all', 'update:users']), userController.updateStudent);
router.delete('/student/:studentId', allowedPermissions(['admin:all', 'moderator:all', 'delete:users']), userController.deleteStudent);

// Teacher-specific operations
router.post('/teacher', allowedPermissions(['admin:all', 'moderator:all', 'create:users']), userController.createTeacher);
router.get('/teachers', allowedPermissions(['admin:all', 'moderator:all', 'read:users']), userController.getAllTeachers);
router.get('/teacher/user/:userId', allowedPermissions(['admin:all', 'moderator:all', 'read:users', 'teacher:all']), userController.getTeacherByUserId);
router.get('/teacher/:teacherId', allowedPermissions(['admin:all', 'moderator:all', 'read:users', 'teacher:all']), userController.getTeacherById);
router.put('/teacher/:teacherId', allowedPermissions(['admin:all', 'moderator:all', 'update:users']), userController.updateTeacher);
router.delete('/teacher/:teacherId', allowedPermissions(['admin:all', 'moderator:all', 'delete:users']), userController.deleteTeacher);

// Administrator-specific operations
router.get('/administrator/:id', allowedPermissions(['admin:all', 'moderator:all', 'read:users']), userController.getUserWithRolesById);
router.get('/administrators', allowedPermissions(['admin:all', 'moderator, all', 'read:users']), userController.getAllAdministrators);
router.post('/administrator', allowedPermissions(['admin:all', 'create:users']), userController.createAdministrator);
router.put('/administrator/:id', allowedPermissions(['admin:all', 'update:users']), userController.updateAdministrator);
router.delete('/administrator/:id', allowedPermissions(['admin:all', 'delete:users']), userController.deleteAdministrator);
export default router;