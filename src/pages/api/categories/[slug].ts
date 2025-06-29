import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });
  const { slug } = req.query;
  const category = await prisma.category.findUnique({
    where: { slug: slug as string },
    include: { subcategories: true }
  });
  if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });
  res.status(200).json({ category });
} 