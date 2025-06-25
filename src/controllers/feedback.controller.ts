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
      include: { fromUser: { select: { id: true, username: true, avatar: true } }, order: true }
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
    // Níveis
    let nivel = 'Bronze';
    if (total >= 201) nivel = 'Ouro';
    else if (total >= 51) nivel = 'Prata';
    if (total >= 500) nivel = 'Diamante';
    if (percentualPositivo >= 98 && total >= 1000) nivel = 'Vendedor Certificado';
    res.json({ total, positivos, neutros, negativos, media, percentualPositivo, nivel });
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