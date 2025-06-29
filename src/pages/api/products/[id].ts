import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../middlewares/auth';
import { withRole } from '../../../middlewares/role';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method === 'GET') {
    const product = await prisma.product.findUnique({ where: { id: id as string } });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    return res.status(200).json({ product });
  }
  if (req.method === 'PUT') {
    const userId = (req as any).user.id;
    const { title, description, price, type, categoryId, subcategoryId, stock, images, warranty, variations, plans, autoDelivery, active } = req.body;
    const product = await prisma.product.findUnique({ where: { id: id as string } });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    if (product.userId !== userId && (req as any).user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
    const updated = await prisma.product.update({
      where: { id: id as string },
      data: { title, description, price, type, categoryId, subcategoryId, stock, images, warranty, variations, plans, autoDelivery, active }
    });
    return res.status(200).json({ product: updated });
  }
  if (req.method === 'DELETE') {
    const userId = (req as any).user.id;
    const product = await prisma.product.findUnique({ where: { id: id as string } });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    if (product.userId !== userId && (req as any).user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
    await prisma.product.delete({ where: { id: id as string } });
    return res.status(204).end();
  }
  return res.status(405).json({ error: 'Método não permitido' });
}

export default authenticate(withRole(['vendedor', 'admin'], handler)); 