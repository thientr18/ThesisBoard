import { Router } from 'express';
import UserController from '../controllers/UserController';
import { checkJwt } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();
const userController = new UserController();

router.use(checkJwt);

// User listing and search - accessible to users with 'read:users' permission
router.get('/', roleMiddleware(['admin:all', 'read:users']), userController.getUsers);
router.get('/search', roleMiddleware(['admin:all', 'read:users']), userController.searchUsers);

// User statistics - admin only
router.get('/statistics', roleMiddleware(['admin:all', 'admin:users']), userController.getUserStatistics);

// Role-based user queries
router.get('/role/:roleName', roleMiddleware(['admin:all', 'read:users']), userController.getUsersByRole);

// Individual user operations
router.get('/:id', roleMiddleware(['admin:all', 'read:users']), userController.getUserById);
router.post('/', roleMiddleware(['admin:all', 'create:users']), userController.createUser);
router.put('/:id', roleMiddleware(['admin:all', 'update:users']), userController.updateUser);
router.delete('/:id', roleMiddleware(['admin:all', 'delete:users']), userController.deleteUser);

// User status management
router.patch('/:id/activate', roleMiddleware(['admin:all', 'update:users']), userController.activateUser);
router.patch('/:id/deactivate', roleMiddleware(['admin:all', 'update:users']), userController.deactivateUser);

// Role management
router.get('/:id/roles', roleMiddleware(['admin:all', 'read:users', 'read:roles']), userController.getUserWithRoles);
router.post('/roles', roleMiddleware(['admin:all', 'manage:roles']), userController.assignRoleToUser);
router.delete('/roles', roleMiddleware(['admin:all', 'manage:roles']), userController.removeRoleFromUser);

export default router;