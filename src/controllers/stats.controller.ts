import { Request, Response } from 'express';
import prisma from '../prisma';

// Leaderboard de vendedores
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ totalSales: 'desc' }, { rating: 'desc' }],
      select: { id: true, username: true, avatarUrl: true, totalSales: true, rating: true }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar ranking.' });
  }
};

// Stats do dashboard
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const sales = await prisma.order.count({ where: { status: 'delivered' } });
    const purchases = await prisma.order.count();
    const disputes = await prisma.dispute.count();
    const reviews = await prisma.review.count();
    res.json({ sales, purchases, disputes, reviews });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar stats.' });
  }
};

// Stats do marketplace
export const getMarketplaceStats = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.count();
    const products = await prisma.product.count();
    const orders = await prisma.order.count();
    const revenueAgg = await prisma.order.aggregate({ _sum: { amount: true } });
    const revenue = revenueAgg._sum.amount || 0;
    res.json({ users, products, orders, revenue });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar stats.' });
  }
}; 