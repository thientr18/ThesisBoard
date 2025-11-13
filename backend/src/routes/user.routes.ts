import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { checkJwt } from '../middlewares/auth.middleware';
import { allowedPermissions } from '../middlewares/permission.middleware';
import { attachUserFromJwt } from '../middlewares/user.middleware';

const router = Router();
const userController = new UserController();

router.use(checkJwt);
router.use(attachUserFromJwt);

// User listing and search
router.get('/', allowedPermissions(['admin:all', 'moderator:all', 'read:users']), userController.getUsers);
router.get('/search', allowedPermissions(['admin:all', 'moderator:all', 'read:users']), userController.searchUsers);

// User statistics
router.get('/statistics', allowedPermissions(['admin:all', 'access:admin_dashboard', 'view:logs']), userController.getUserStatistics);

// Role-based user queries
router.get('/role/:roleName', allowedPermissions(['admin:all', 'moderator:all', 'read:users', 'manage:roles']), userController.getUsersByRole);

// Individual user operations
router.get('/me', userController.getCurrentUserProfile);

router.get('/:id', allowedPermissions(['admin:all', 'moderator:all', 'read:users']), userController.getUserById);
router.post('/', allowedPermissions(['admin:all', 'create:users']), userController.createUser);
router.put('/:id', allowedPermissions(['admin:all', 'update:users']), userController.updateUser);
router.delete('/:id', allowedPermissions(['admin:all', 'delete:users']), userController.deleteUser);

// User status management
router.patch('/:id/activate', allowedPermissions(['admin:all', 'update:users']), userController.activateUser);
router.patch('/:id/deactivate', allowedPermissions(['admin:all', 'update:users']), userController.deactivateUser);

// Role management
router.get('/:id/roles', allowedPermissions(['admin:all', 'read:users', 'manage:roles']), userController.getUserWithRoles);
router.post('/roles', allowedPermissions(['admin:all', 'manage:roles']), userController.assignRoleToUser);
router.delete('/roles', allowedPermissions(['admin:all', 'manage:roles']), userController.removeRoleFromUser);

// Student-specific operations
router.get('/student/:id', allowedPermissions(['admin:all', 'moderator:all', 'read:users']), userController.getStudentById);
// router.put('/student/:id', allowedPermissions(['admin:all', 'update:users']), userController.updateStudent);

// Teacher-specific operations
router.get('/teacher/:id', allowedPermissions(['admin:all', 'moderator:all', 'read:users']), userController.getTeacherById);
// router.put('/teacher/:id', allowedPermissions(['admin:all', 'update:users']), userController.updateTeacher);

export default router;