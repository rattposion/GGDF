import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../middlewares/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Método não permitido' });
  const userId = (req as any).user.id;
  const { nickname, pixKey } = req.body;
  const user = await prisma.user.update({ where: { id: userId }, data: { nickname, pixKey } });
  res.status(200).json({ message: 'Dados atualizados', user: { id: user.id, nickname: user.nickname, pixKey: user.pixKey } });
}

export default authenticate(handler); 