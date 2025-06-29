import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../middlewares/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = (req as any).user.id;
  if (req.method === 'GET') {
    const logs = await prisma.log.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return res.status(200).json({ logs });
  }
  if (req.method === 'POST') {
    const { action, details } = req.body;
    if (!action) return res.status(400).json({ error: 'Ação obrigatória' });
    const log = await prisma.log.create({ data: { userId, action, details } });
    return res.status(201).json({ log });
  }
  return res.status(405).json({ error: 'Método não permitido' });
}

export default authenticate(handler); 