import { Router } from 'express';
import { getInventory, importItems, getPrice } from '../controllers/steamController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { steamRateLimiter } from '../middlewares/rateLimit';

const router = Router();

router.get('/inventory/:steamId', authenticateJWT, steamRateLimiter, getInventory);
router.post('/import', authenticateJWT, steamRateLimiter, importItems);
router.get('/price/:market_hash_name', steamRateLimiter, getPrice);

export default router; 