import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { checkJwt } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();
const userController = new UserController();

router.use(checkJwt);

// User listing and search - accessible to users with 'read:users' permission
router.get('/', roleMiddleware(['admin:all', 'moderator:all', 'read:users']), userController.getUsers);
router.get('/search', roleMiddleware(['admin:all', 'moderator:all', 'read:users']), userController.searchUsers);

// User statistics - admin dashboard access required
router.get('/statistics', roleMiddleware(['admin:all', 'access:admin_dashboard', 'view:logs']), userController.getUserStatistics);

// Role-based user queries
router.get('/role/:roleName', roleMiddleware(['admin:all', 'moderator:all', 'read:users', 'manage:roles']), userController.getUsersByRole);

// Individual user operations
router.get('/:id', roleMiddleware(['admin:all', 'moderator:all', 'read:users']), userController.getUserById);
router.post('/', roleMiddleware(['admin:all', 'create:users']), userController.createUser);
router.put('/:id', roleMiddleware(['admin:all', 'update:users']), userController.updateUser);
router.delete('/:id', roleMiddleware(['admin:all', 'delete:users']), userController.deleteUser);

// User status management
router.patch('/:id/activate', roleMiddleware(['admin:all', 'update:users']), userController.activateUser);
router.patch('/:id/deactivate', roleMiddleware(['admin:all', 'update:users']), userController.deactivateUser);

// Role management
router.get('/:id/roles', roleMiddleware(['admin:all', 'read:users', 'manage:roles']), userController.getUserWithRoles);
router.post('/roles', roleMiddleware(['admin:all', 'manage:roles']), userController.assignRoleToUser);
router.delete('/roles', roleMiddleware(['admin:all', 'manage:roles']), userController.removeRoleFromUser);

export default router;