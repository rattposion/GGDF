import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });
  const { q, categoriaId, tipo, min, max, vendedorId, reputacao } = req.query;
  const where: any = {};
  if (q) where.title = { contains: q, mode: 'insensitive' };
  if (categoriaId) where.categoryId = categoriaId;
  if (tipo) where.type = tipo;
  if (min) where.price = { ...where.price, gte: Number(min) };
  if (max) where.price = { ...where.price, lte: Number(max) };
  if (vendedorId) where.userId = vendedorId;
  if (reputacao) where.user = { reputation: { gte: Number(reputacao) } };
  const products = await prisma.product.findMany({ where });
  res.status(200).json({ products });
} 