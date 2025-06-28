import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { z } from 'zod';
import { validate } from '../middlewares/validate';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

export default router; 