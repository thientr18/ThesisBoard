import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { checkJwt } from '../middlewares/auth.middleware';
import { allowedPermissions } from '../middlewares/permission.middleware';
import { attachUserFromJwt } from '../middlewares/user.middleware';

const router = Router();
const userController = new UserController();

router.use(checkJwt);
router.use(attachUserFromJwt);

// Student-specific operations
router.get('/student/:id', allowedPermissions(['admin:all', 'moderator:all', 'read:users']), userController.getStudentById);
// router.put('/student/:id', allowedPermissions(['admin:all', 'update:users']), userController.updateStudent);

// Teacher-specific operations
router.get('/teacher/:id', allowedPermissions(['admin:all', 'moderator:all', 'read:users']), userController.getTeacherById);
// router.put('/teacher/:id', allowedPermissions(['admin:all', 'update:users']), userController.updateTeacher);

// General user management
router.post('/', allowedPermissions(['admin:all']), userController.createUser);
router.put('/:id', allowedPermissions(['admin:all']), userController.updateUser);
router.delete('/:id', allowedPermissions(['admin:all']), userController.deleteUser);
router.get('/', allowedPermissions(['admin:all']), userController.listUsers);
router.patch('/:id/activate', allowedPermissions(['admin:all', 'update:users']), userController.activateUser);
router.patch('/:id/deactivate', allowedPermissions(['admin:all', 'update:users']), userController.deactivateUser);

// Role management
router.get('/:id/roles', allowedPermissions(['admin:all', 'read:users', 'manage:roles']), userController.getUserWithRoles);
router.post('/roles', allowedPermissions(['admin:all', 'manage:roles']), userController.assignRoleToUser);
router.delete('/roles', allowedPermissions(['admin:all', 'manage:roles']), userController.removeRoleFromUser);

// User listing and search
router.get('/me', userController.getCurrentUserProfile);
router.get('/search', allowedPermissions(['admin:all', 'moderator:all', 'read:users']), userController.searchUsers);
router.get('/role/:roleName', allowedPermissions(['admin:all', 'moderator:all', 'read:users', 'manage:roles']), userController.getUsersByRole);
router.get('/statistics', allowedPermissions(['admin:all', 'access:admin_dashboard', 'view:logs']), userController.getUserStatistics);

export default router;