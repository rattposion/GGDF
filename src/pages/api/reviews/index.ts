import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../middlewares/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const userId = (req as any).user.id;
    const { orderId, sellerId, stars, comment } = req.body;
    if (!orderId || !sellerId || !stars) return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.buyerId !== userId) return res.status(403).json({ error: 'Pedido inválido' });
    const review = await prisma.review.create({ data: { orderId, sellerId, stars, comment } });
    return res.status(201).json({ review });
  }
  if (req.method === 'GET') {
    const { vendedorId } = req.query;
    if (!vendedorId) return res.status(400).json({ error: 'vendedorId obrigatório' });
    const reviews = await prisma.review.findMany({ where: { sellerId: vendedorId as string } });
    return res.status(200).json({ reviews });
  }
  return res.status(405).json({ error: 'Método não permitido' });
}

export default authenticate(handler); 