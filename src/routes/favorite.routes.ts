import { Router } from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favorite.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getFavorites);
router.post('/', authenticate, addFavorite);
router.delete('/:id', authenticate, removeFavorite);

export default router; 