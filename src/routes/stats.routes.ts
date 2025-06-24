import { Router } from 'express';
import { getLeaderboard, getDashboardStats, getMarketplaceStats } from '../controllers/stats.controller';

const router = Router();

router.get('/leaderboard', getLeaderboard);
router.get('/dashboard', getDashboardStats);
router.get('/marketplace', getMarketplaceStats);

export default router; 