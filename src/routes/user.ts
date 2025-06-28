import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser, updateSteamId } from '../controllers/userController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { z } from 'zod';
import { validate } from '../middlewares/validate';

const router = Router();

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional()
});

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', authenticateJWT, validate(updateUserSchema), updateUser);
router.delete('/:id', authenticateJWT, deleteUser);
router.patch('/steamid', authenticateJWT, updateSteamId);

export default router; 