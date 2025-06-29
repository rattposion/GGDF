import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../middlewares/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { pedidoId } = req.query;
  if (req.method === 'GET') {
    const delivery = await prisma.delivery.findFirst({ where: { order: { id: pedidoId as string } } });
    if (!delivery) return res.status(404).json({ error: 'Entrega não encontrada' });
    return res.status(200).json({ delivery });
  }
  if (req.method === 'POST') {
    const { type, content } = req.body;
    if (!type || !content) return res.status(400).json({ error: 'Tipo e conteúdo obrigatórios' });
    // Mock: cria entrega automática
    const delivery = await prisma.delivery.create({ data: { type, content, status: 'entregue', order: { connect: { id: pedidoId as string } } } });
    await prisma.order.update({ where: { id: pedidoId as string }, data: { status: 'entregue', deliveryId: delivery.id } });
    return res.status(201).json({ delivery });
  }
  return res.status(405).json({ error: 'Método não permitido' });
}

export default authenticate(handler); 