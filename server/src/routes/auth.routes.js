import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validateLogin } from '@todo-app/shared';
import { login, me } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import env from '../config/env.js';

const router = Router();

// Slows down password guessing. Skipped in tests so the suite can log in freely.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.isTest,
  message: { message: 'Too many login attempts. Please wait a few minutes and try again.' },
});

router.post('/login', loginLimiter, validateBody(validateLogin), login);
router.get('/me', requireAuth, me);

export default router;
