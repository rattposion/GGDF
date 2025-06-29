import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../middlewares/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const userId = (req as any).user.id;
    const { productId, question } = req.body;
    if (!productId || !question) return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    // Mock: cria pergunta (deveria criar entidade Question)
    const q = await prisma.log.create({ data: { userId, action: 'question', details: JSON.stringify({ productId, question }) } });
    return res.status(201).json({ question: q });
  }
  if (req.method === 'GET') {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ error: 'productId obrigatório' });
    // Mock: busca perguntas (deveria buscar entidade Question)
    const questions = await prisma.log.findMany({ where: { action: 'question', details: { contains: productId as string } } });
    return res.status(200).json({ questions });
  }
  return res.status(405).json({ error: 'Método não permitido' });
}

export default authenticate(handler); 