import { Router } from 'express';
import { checkJwt, requireAdmin } from '../middlewares/authMiddleware';
import { roleMiddleware, requireAllPermissions } from '../middlewares/roleMiddleware';
import * as UserController from '../controllers/UserController';
import * as ThesisController from '../controllers/ThesisController';
import * as PreThesisController from '../controllers/PreThesisController';


const router = Router();

// Example protected routes
router.get('/protected', 
  checkJwt, 
  (req, res) => {
    res.json({
      message: 'This is a protected endpoint - only authenticated users can access it',
      user: req.auth
    });
  }
);

router.get('/admin', 
  checkJwt, 
  requireAdmin, 
  (req, res) => {
    res.json({
      message: 'This is an admin endpoint - only admins can access it',
      user: req.auth
    }
  );
});

// Route requiring specific roles or permissions
router.get('/me', 
  checkJwt,
  UserController.getMe
);

// Route accessible to users with either read:users OR update:users permission
router.get('/users', 
  checkJwt, 
  roleMiddleware(['read:users', 'update:users']), 
  UserController.getUsers
);

// Route accessible only to admins
router.delete('/users/:id', 
  checkJwt, 
  roleMiddleware(['admin:all', 'delete:users']), 
  UserController.deleteUser
);

router.get('/me/thesis', 
  checkJwt,
  ThesisController.getMyTheses
);

// Route that requires ALL specified permissions (user must have both)
router.post('/thesis/review', 
  checkJwt,
  requireAllPermissions(['teacher:reviewer', 'grade:thesis_reviews']),
  ThesisController.submitReview
);

// Different permissions for different HTTP methods on the same resource
router.route('/topics/:id')
  .get(checkJwt, roleMiddleware(['view:topics']), PreThesisController.getTopic)
  .put(checkJwt, roleMiddleware(['update:topics']), PreThesisController.updateTopic)
  .delete(checkJwt, roleMiddleware(['delete:topics']), PreThesisController.deleteTopic);

// Complex workflow with role-specific permissions
router.post('/thesis-proposals/:id/approve',
  checkJwt,
  roleMiddleware(['teacher:supervisor', 'approve:thesis_registrations']),
  ThesisController.approveProposal
);

export default router;