import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../middlewares/auth';
import { withRole } from '../../../middlewares/role';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const products = await prisma.product.findMany({ where: { active: false } });
    return res.status(200).json({ products });
  }
  return res.status(405).json({ error: 'Método não permitido' });
}

export default authenticate(withRole(['admin'], handler)); 