import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../../middlewares/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });
  const { roomId } = req.query;
  const messages = await prisma.chatMessage.findMany({ where: { roomId: roomId as string }, orderBy: { createdAt: 'asc' } });
  res.status(200).json({ messages });
}

export default authenticate(handler); 