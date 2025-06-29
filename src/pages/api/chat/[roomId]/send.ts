import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../../middlewares/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  const userId = (req as any).user.id;
  const { roomId } = req.query;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Conteúdo obrigatório' });
  const chatRoom = await prisma.chatRoom.findUnique({ where: { id: roomId as string } });
  if (!chatRoom) return res.status(404).json({ error: 'Chat não encontrado' });
  const message = await prisma.chatMessage.create({ data: { roomId: roomId as string, senderId: userId, content } });
  res.status(201).json({ message });
}

export default authenticate(handler); 