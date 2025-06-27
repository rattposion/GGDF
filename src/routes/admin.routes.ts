import { Router } from 'express';
import {
  getUsers,
  banUser,
  getProducts,
  setProductActive,
  getOrders,
  resolveDispute,
  getWallets,
  getTransactions,
  getWithdrawals,
  approveWithdrawal,
  getIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  getAffiliates,
  createAffiliate,
  updateAffiliate,
  deleteAffiliate,
  approveAffiliateWithdrawal,
  getAdminChats,
  getAdminMessages,
  createAdminChat,
  sendAdminMessage,
  getDashboard,
  highlightProduct
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
router.get('/wallets', authenticate, getWallets);
router.get('/transactions', authenticate, getTransactions);
router.get('/withdrawals', authenticate, getWithdrawals);
router.put('/withdrawals/:id/approve', authenticate, approveWithdrawal);
router.patch('/reports/:id', authenticate, async (req, res) => {
  try {
    const { acao } = req.body;
    let status = 'pendente';
    if (acao === 'resolver') status = 'resolvida';
    if (acao === 'abuso') status = 'abuso';
    const report = await prisma.report.update({ where: { id: req.params.id }, data: { status } });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar denúncia.' });
  }
});
router.get('/integrations', authenticate, getIntegrations);
router.post('/integrations', authenticate, createIntegration);
router.put('/integrations/:id', authenticate, updateIntegration);
router.delete('/integrations/:id', authenticate, deleteIntegration);
router.get('/affiliates', authenticate, getAffiliates);
router.post('/affiliates', authenticate, createAffiliate);
router.put('/affiliates/:id', authenticate, updateAffiliate);
router.delete('/affiliates/:id', authenticate, deleteAffiliate);
router.put('/affiliates/:id/approve-withdrawal', authenticate, approveAffiliateWithdrawal);
router.get('/admin-chats', authenticate, getAdminChats);
router.get('/admin-chats/:chatId/messages', authenticate, getAdminMessages);
router.post('/admin-chats', authenticate, createAdminChat);
router.post('/admin-chats/:chatId/messages', authenticate, sendAdminMessage);
router.get('/dashboard', authenticate, getDashboard);
router.put('/products/:productId/highlight', authenticate, highlightProduct);
router.get('/social-accounts', authenticate, async (req, res) => {
  try {
    const accounts = await prisma.socialAccount.findMany({
      include: { user: { select: { id: true, username: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar contas sociais.' });
  }
});
router.get('/link-logs', authenticate, async (req, res) => {
  try {
    const logs = await prisma.linkLog.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar logs de vinculação.' });
  }
});

export default router; 