import { Router } from 'express';
import { checkJwt, requireAdmin } from '../middlewares/authMiddleware';
import { AppError } from '../utils/AppError';
import { getResource } from '../controllers/userController';

const router = Router();

router.get('/protected', checkJwt, (req, res) => {
  res.json({
    message: 'This is a protected endpoint - only authenticated users can access it',
    user: req.auth
  });
});

router.get('/me', checkJwt, (req, res) => {
  res.json({
    message: 'This is your profile information',
    user: req.auth
  });
});

router.get('/resource/:id', checkJwt, getResource);

router.get('/admin', checkJwt, requireAdmin, (req, res) => {
  res.json({
    message: 'This is an admin endpoint - only admins can access it',
    user: req.auth
  });
});

export default router;