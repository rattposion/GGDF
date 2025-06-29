import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../../../middlewares/auth';
import { withRole } from '../../../../../middlewares/role';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  const { id } = req.query;
  const product = await prisma.product.update({ where: { id: id as string }, data: { active: true } });
  res.status(200).json({ product });
}

export default authenticate(withRole(['admin'], handler)); 