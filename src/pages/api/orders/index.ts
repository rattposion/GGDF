import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../middlewares/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const userId = (req as any).user.id;
    const orders = await prisma.order.findMany({ where: { buyerId: userId }, include: { product: true } });
    return res.status(200).json({ orders });
  }
  if (req.method === 'POST') {
    const userId = (req as any).user.id;
    const { productId, selectedVariation, selectedPlan } = req.body;
    if (!productId) return res.status(400).json({ error: 'Produto obrigatório' });
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    const order = await prisma.order.create({
      data: {
        buyerId: userId,
        productId,
        selectedVariation,
        selectedPlan,
        status: 'pendente',
      }
    });
    return res.status(201).json({ order });
  }
  return res.status(405).json({ error: 'Método não permitido' });
}

export default authenticate(handler); 