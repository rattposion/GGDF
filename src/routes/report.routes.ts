import { Router } from 'express';
import { getReports, createReport } from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getReports);
router.post('/', authenticate, createReport);

export default router; 