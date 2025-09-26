import { Router } from 'express';

const router = Router();

router.get('/public', (req, res) => {
  res.json({ message: 'This is a public endpoint - anyone can access it' });
});

export default router;