import { Request, Response } from 'express';
import prisma from '../prisma';

// Listar notificações do usuário
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar notificações.' });
  }
};

// Marcar notificação como lida
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ error: 'Notificação não encontrada.' });
    }
    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao marcar como lida.' });
  }
}; 