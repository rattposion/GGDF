import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../middlewares/auth';
import { withRole } from '../../../middlewares/role';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { tipo, categoriaId, userId, destaque } = req.query;
    const where: any = {};
    if (tipo) where.type = tipo;
    if (categoriaId) where.categoryId = categoriaId;
    if (userId) where.userId = userId;
    if (destaque) where.active = true;
    const products = await prisma.product.findMany({ where });
    return res.status(200).json({ products });
  }
  if (req.method === 'POST') {
    const { title, description, price, type, categoryId, subcategoryId, stock, images, warranty, variations, plans, autoDelivery } = req.body;
    const userId = (req as any).user.id;
    if (!title || !price || !type || !categoryId) return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    const product = await prisma.product.create({
      data: {
        userId,
        title,
        description,
        price,
        type,
        categoryId,
        subcategoryId,
        stock: stock || 1,
        images,
        warranty,
        variations,
        plans,
        autoDelivery,
        active: true,
      }
    });
    return res.status(201).json({ product });
  }
  return res.status(405).json({ error: 'Método não permitido' });
}

export default authenticate(withRole(['vendedor', 'admin'], handler)); 