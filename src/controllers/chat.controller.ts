import { Request, Response } from 'express';
import prisma from '../prisma';

// Listar mensagens de um pedido
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).userId;
    // Verifica se o usuário faz parte do pedido
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || (order.buyerId !== userId && order.sellerId !== userId)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }
    const messages = await prisma.chatMessage.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar mensagens.' });
  }
};

// Enviar mensagem
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).userId;
    const { message, type } = req.body;
    // Verifica se o usuário faz parte do pedido
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || (order.buyerId !== userId && order.sellerId !== userId)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }
    const msg = await prisma.chatMessage.create({
      data: {
        orderId,
        senderId: userId,
        message,
        type: type || 'text',
      },
    });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
}; 