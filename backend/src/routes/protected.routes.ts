import { Router } from 'express';
import { checkJwt, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.get('/protected', checkJwt, (req, res) => {
  res.json({
    message: 'This is a protected endpoint - only authenticated users can access it',
    user: req.auth
  });
});

router.get('/admin', checkJwt, requireAdmin, (req, res) => {
  res.json({
    message: 'This is an admin endpoint - only admins can access it',
    user: req.auth
  });
});

export default router;