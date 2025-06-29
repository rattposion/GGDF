import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../../middlewares/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  const userId = (req as any).user.id;
  const { roomId } = req.query;
  // Buscar o pedido relacionado ao roomId (assumindo que roomId é o orderId)
  const order = await prisma.order.findUnique({ where: { id: roomId as string } });
  if (!order || order.buyerId !== userId) return res.status(403).json({ error: 'Pedido inválido' });
  let chatRoom = await prisma.chatRoom.findUnique({ where: { orderId: roomId as string } });
  if (!chatRoom) {
    chatRoom = await prisma.chatRoom.create({ data: { orderId: roomId as string } });
  }
  res.status(200).json({ chatRoom });
}

export default authenticate(handler); 