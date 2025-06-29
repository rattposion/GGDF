import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../middlewares/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = (req as any).user.id;
  if (req.method === 'GET') {
    const notifications = await prisma.notification.findMany({ where: { userId } });
    return res.status(200).json({ notifications });
  }
  if (req.method === 'POST') {
    await prisma.notification.updateMany({ where: { userId }, data: { read: true } });
    return res.status(200).json({ message: 'Notificações marcadas como lidas.' });
  }
  return res.status(405).json({ error: 'Método não permitido' });
}

export default authenticate(handler); 