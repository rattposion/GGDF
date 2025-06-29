import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../middlewares/auth';
import { withRole } from '../../../middlewares/role';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const categories = await prisma.category.findMany({
      include: { subcategories: true }
    });
    return res.status(200).json({ categories });
  }
  if (req.method === 'POST') {
    const { name, slug } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'Nome e slug obrigatórios' });
    const exists = await prisma.category.findUnique({ where: { slug } });
    if (exists) return res.status(409).json({ error: 'Slug já cadastrado' });
    const category = await prisma.category.create({ data: { name, slug } });
    return res.status(201).json({ category });
  }
  return res.status(405).json({ error: 'Método não permitido' });
}

export default authenticate(withRole(['admin'], handler)); 