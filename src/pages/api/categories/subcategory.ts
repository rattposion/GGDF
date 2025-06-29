import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../middlewares/auth';
import { withRole } from '../../../middlewares/role';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  const { name, slug, categoryId } = req.body;
  if (!name || !slug || !categoryId) return res.status(400).json({ error: 'Nome, slug e categoryId obrigatórios' });
  const exists = await prisma.subcategory.findUnique({ where: { slug } });
  if (exists) return res.status(409).json({ error: 'Slug já cadastrado' });
  const subcategory = await prisma.subcategory.create({ data: { name, slug, categoryId } });
  res.status(201).json({ subcategory });
}

export default authenticate(withRole(['admin'], handler)); 