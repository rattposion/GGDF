import { Router } from 'express';
import { createFeedback, listUserFeedbacks, getUserReputation, reportFeedback, createAutoFeedback } from '../controllers/feedback.controller';

const router = Router();

router.post('/feedbacks', createFeedback);
router.get('/users/:id/feedbacks', listUserFeedbacks);
router.get('/users/:id/reputation', getUserReputation);
router.put('/feedbacks/:id/report', reportFeedback);
router.post('/feedbacks/auto', createAutoFeedback);

export default router; 