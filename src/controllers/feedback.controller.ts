import { Request, Response } from 'express';
import prisma from '../prisma';

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const { orderId, fromUserId, toUserId, rating, comment, isAutomatic } = req.body;
    if (!orderId || !fromUserId || !toUserId || !rating || !comment) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }
    // Validação: só pode avaliar após transação concluída
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== 'completed') {
      return res.status(400).json({ error: 'Transação não finalizada.' });
    }
    // Validação: um feedback por transação/usuário
    const existing = await prisma.feedback.findFirst({
      where: { orderId, fromUserId, toUserId }
    });
    if (existing) {
      return res.status(400).json({ error: 'Feedback já enviado para esta transação.' });
    }
    // Derivar tipo
    let type = 'neutro';
    if (rating >= 4) type = 'positivo';
    else if (rating <= 2) type = 'negativo';
    const feedback = await prisma.feedback.create({
      data: {
        orderId, fromUserId, toUserId, rating, comment, type, isAutomatic: !!isAutomatic
      }
    });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar feedback.' });
  }
};

export const listUserFeedbacks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const feedbacks = await prisma.feedback.findMany({
      where: { toUserId: id },
      orderBy: { createdAt: 'desc' },
      include: { fromUser: { select: { id: true, username: true, avatarUrl: true } }, order: true }
    });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar feedbacks.' });
  }
};

export const getUserReputation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const feedbacks = await prisma.feedback.findMany({ where: { toUserId: id, status: 'active' } });
    const total = feedbacks.length;
    const positivos = feedbacks.filter(f => f.rating >= 4).length;
    const neutros = feedbacks.filter(f => f.rating === 3).length;
    const negativos = feedbacks.filter(f => f.rating <= 2).length;
    const media = total > 0 ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / total) : 0;
    const percentualPositivo = total > 0 ? (positivos / total) * 100 : 0;

    // Buscar dados extras do usuário
    const user = await prisma.user.findUnique({ where: { id } });
    const vendas = user?.totalSales || 0;
    const kyc = user?.kyc || false;
    const twofa = user?.twofa || false;
    // Buscar disputas dos últimos 6 meses
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
    const disputasRecentes = await prisma.dispute.count({
      where: {
        OR: [
          { order: { sellerId: id } },
          { order: { buyerId: id } }
        ],
        createdAt: { gte: seisMesesAtras },
        status: { not: 'resolved' }
      }
    });
    const semDisputas = disputasRecentes === 0;

    // Lógica de rank
    let nivel = 'Sem Rank';
    let progresso = 0;
    if (vendas >= 10000 && percentualPositivo >= 98 && semDisputas) { nivel = 'Elite'; progresso = 100; }
    else if (vendas >= 5001 && percentualPositivo >= 97) { nivel = 'Diamante'; progresso = Math.min(100, vendas / 10000 * 100); }
    else if (vendas >= 1001 && percentualPositivo >= 95) { nivel = 'Platina'; progresso = Math.min(100, vendas / 5001 * 100); }
    else if (vendas >= 501 && percentualPositivo >= 92) { nivel = 'Ouro'; progresso = Math.min(100, vendas / 1001 * 100); }
    else if (vendas >= 101 && percentualPositivo >= 90) { nivel = 'Prata'; progresso = Math.min(100, vendas / 501 * 100); }
    else if (vendas >= 21 && percentualPositivo >= 85) { nivel = 'Bronze'; progresso = Math.min(100, vendas / 101 * 100); }
    else if (vendas >= 0 && percentualPositivo >= 80) { nivel = 'Iniciante'; progresso = Math.min(100, vendas / 21 * 100); }

    const isVerifiedRank = !!(kyc && twofa);

    return res.json({ total, positivos, neutros, negativos, media, percentualPositivo, nivel, isVerifiedRank, progresso });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao calcular reputação.' });
  }
};

export const reportFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reportedById } = req.body;
    const feedback = await prisma.feedback.update({
      where: { id },
      data: { status: 'reported', reportedById }
    });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao denunciar feedback.' });
  }
};

export const createAutoFeedback = async (req: Request, res: Response) => {
  try {
    const { orderId, fromUserId, toUserId, rating, comment } = req.body;
    // Validação: só pode criar automático se não existir
    const existing = await prisma.feedback.findFirst({ where: { orderId, fromUserId, toUserId } });
    if (existing) {
      return res.status(400).json({ error: 'Feedback já existe.' });
    }
    let type = 'negativo';
    if (rating >= 4) type = 'positivo';
    else if (rating === 3) type = 'neutro';
    const feedback = await prisma.feedback.create({
      data: {
        orderId, fromUserId, toUserId, rating, comment, type, isAutomatic: true
      }
    });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar feedback automático.' });
  }
}; 