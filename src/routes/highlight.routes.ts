import { Router } from 'express';
import { getHighlights, purchaseHighlight } from '../controllers/highlight.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getHighlights);
router.post('/purchase', authenticate, purchaseHighlight);

export default router; 