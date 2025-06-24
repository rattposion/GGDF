import { Router } from 'express';
import axios from 'axios';
import { authenticate } from '../middlewares/auth.middleware';
import prisma from '../prisma';
import { io } from '../socket';

const router = Router();

router.post('/charge', authenticate, async (req, res) => {
  const { amount, description, orderId } = req.body;
  const { data } = await axios.post('https://api.openpix.com.br/api/v1/charge', {
    value: amount,
    comment: description,
    correlationID: orderId
  }, { headers: { Authorization: `Bearer ${process.env.PIX_API_KEY}` } });
  res.json(data);
});

router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    const txid = event?.charge?.correlationID;
    if (!txid) return res.sendStatus(400);
    const order = await prisma.order.findUnique({ where: { id: txid } });
    if (!order) return res.sendStatus(404);
    await prisma.order.update({ where: { id: txid }, data: { status: 'paid' } });
    io.to(order.buyerId).emit('notification', {
      type: 'payment',
      title: 'Pagamento confirmado!',
      message: `Seu pagamento do pedido #${order.id} foi confirmado.`,
      actionUrl: `/orders/${order.id}`
    });
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  }
});

export default router; 