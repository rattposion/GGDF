import { Router } from 'express';
import {
  getUsers,
  banUser,
  getProducts,
  setProductActive,
  getOrders,
  resolveDispute
} from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import prisma from '../prisma';

const router = Router();

router.get('/users', authenticate, getUsers);
router.put('/users/:id/ban', authenticate, banUser);
router.get('/products', authenticate, getProducts);
router.put('/products/:id/active', authenticate, setProductActive);
router.get('/orders', authenticate, getOrders);
router.put('/disputes/:id/resolve', authenticate, async (req, res) => {
  await prisma.dispute.update({ where: { id: req.params.id }, data: { status: 'resolved', resolution: req.body.resolution } });
  await prisma.order.update({ where: { id: req.body.orderId }, data: { status: 'completed' } });
  res.json({ success: true });
});
router.put('/products/:id/approve', authenticate, async (req, res) => {
  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: true } });
  res.json({ success: true });
});
router.delete('/reviews/:id', authenticate, async (req, res) => {
  await prisma.review.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});
router.delete('/questions/:id', authenticate, async (req, res) => {
  await prisma.question.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router; 