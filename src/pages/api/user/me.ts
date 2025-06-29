import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../middlewares/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });
  const userId = (req as any).user.id;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, nickname: true, accountType: true, verified: true, reputation: true, status2FA: true, documentSent: true, pixKey: true } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.status(200).json({ user });
}

export default authenticate(handler); 