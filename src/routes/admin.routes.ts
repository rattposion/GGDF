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
router.get('/reports', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.report.findMany({
        include: { user: { select: { username: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.report.count()
    ]);
    res.json({ data, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar relatórios.' });
  }
});
router.get('/logs', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.log.count()
    ]);
    res.json({ logs, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar logs.' });
  }
});
router.get('/logs/analytics', authenticate, async (req, res) => {
  try {
    const analytics = await prisma.log.groupBy({
      by: ['type'],
      _count: { type: true }
    });
    res.json({ analytics });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar analytics dos logs.' });
  }
});

export default router; 