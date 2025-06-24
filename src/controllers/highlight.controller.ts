import { Request, Response } from 'express';
import prisma from '../prisma';

// Listar destaques ativos
export const getHighlights = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const highlights = await prisma.highlight.findMany({
      where: { status: 'active', startDate: { lte: now }, endDate: { gte: now } },
      include: { product: { include: { category: true, subcategory: true } } }
    });
    res.json(highlights.map(h => ({ ...h.product, highlightId: h.id, highlightPlan: h.plan, highlightEnd: h.endDate })));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar destaques.' });
  }
};

// Comprar destaque
export const purchaseHighlight = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { productId, plan } = req.body;
    let days = 7;
    if (plan === '15d') days = 15;
    if (plan === '30d') days = 30;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);
    const highlight = await prisma.highlight.create({
      data: { userId, productId, plan, startDate, endDate, status: 'active' }
    });
    res.json(highlight);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao comprar destaque.' });
  }
}; 