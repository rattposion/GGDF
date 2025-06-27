import { Router } from 'express';
import { createOrder, getOrders, getOrderById, updateOrder } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';
import prisma from '../prisma';
import { io } from '../index';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id', authenticate, updateOrder);

// Entrega automática para o comprador
router.get('/:id/delivery', authenticate, async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
  if (order.status === 'cancelled') return res.status(403).json({ error: 'Acesso à entrega bloqueado: assinatura cancelada.' });
  // Retorne deliveryContent ou arquivo associado ao pedido/produto
  res.json({ deliveryType: 'file', deliveryContent: 'link-ou-texto', deliveryFile: '/uploads/arquivo.zip' });
});

// Renovar assinatura
router.post('/:id/renew', authenticate, async (req, res) => {
  // Exemplo: adiciona 30 dias à validade
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
  const novaData = new Date(order.completedAt || new Date());
  novaData.setDate(novaData.getDate() + 30);
  await prisma.order.update({ where: { id: req.params.id }, data: { completedAt: novaData, status: 'paid' } });
  io.to(order.buyerId).emit('notification', {
    type: 'info',
    title: 'Assinatura renovada',
    message: `Sua assinatura do pedido #${order.id} foi renovada.`,
    actionUrl: `/orders/${order.id}`
  });
  res.json({ success: true });
});

// Cancelar assinatura
router.post('/:id/cancel', authenticate, async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
  await prisma.order.update({ where: { id: req.params.id }, data: { status: 'cancelled' } });
  io.to(order.buyerId).emit('notification', {
    type: 'info',
    title: 'Assinatura cancelada',
    message: `Sua assinatura do pedido #${order.id} foi cancelada.`,
    actionUrl: `/orders/${order.id}`
  });
  res.json({ success: true });
});

// Entrega liberada
router.put('/:id/deliver', authenticate, async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
  await prisma.order.update({ where: { id: req.params.id }, data: { status: 'delivered' } });
  io.to(order.buyerId).emit('notification', {
    type: 'delivery',
    title: 'Entrega liberada',
    message: `A entrega do pedido #${order.id} está disponível.`,
    actionUrl: `/orders/${order.id}`
  });
  res.json({ success: true });
});

// Notificações para disputa, avaliação, pergunta/resposta
router.post('/:id/dispute', authenticate, async (req, res) => {
  // ... lógica de disputa ...
  io.to('admin').emit('notification', {
    type: 'dispute',
    title: 'Nova disputa aberta',
    message: `Disputa aberta no pedido #${req.params.id}`,
    actionUrl: `/admin/disputes/${req.params.id}`
  });
  res.json({ success: true });
});

router.post('/:id/review', authenticate, async (req, res) => {
  // ... lógica de avaliação ...
  io.to('admin').emit('notification', {
    type: 'review',
    title: 'Nova avaliação recebida',
    message: `Nova avaliação no pedido #${req.params.id}`,
    actionUrl: `/admin/reviews/${req.params.id}`
  });
  res.json({ success: true });
});

router.post('/:id/question', authenticate, async (req, res) => {
  // ... lógica de pergunta ...
  io.to('admin').emit('notification', {
    type: 'info',
    title: 'Nova pergunta',
    message: `Nova pergunta no pedido #${req.params.id}`,
    actionUrl: `/admin/questions/${req.params.id}`
  });
  res.json({ success: true });
});

export default router; 