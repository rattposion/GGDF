import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../../middlewares/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  const userId = (req as any).user.id;
  const { id } = req.query;
  const order = await prisma.order.findUnique({ where: { id: id as string } });
  if (!order || order.buyerId !== userId) return res.status(404).json({ error: 'Pedido não encontrado' });
  // Mock: cria disputa (deveria criar entidade Dispute e logs)
  await prisma.order.update({ where: { id: id as string }, data: { status: 'disputa' } });
  res.status(200).json({ message: 'Disputa aberta (mock).' });
}

export default authenticate(handler); 