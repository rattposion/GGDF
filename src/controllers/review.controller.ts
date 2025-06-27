import { Request, Response } from 'express';
import prisma from '../prisma';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Buscar avaliações enviadas (sent) e recebidas (received) pelo usuário autenticado
export const getUserReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { type } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    if (!type || (type !== 'sent' && type !== 'received')) {
      return res.status(400).json({ error: 'Tipo inválido. Use ?type=sent ou ?type=received.' });
    }

    let reviews;
    if (type === 'sent') {
      // Avaliações que o usuário enviou (como comprador)
      reviews = await prisma.review.findMany({
        where: { buyerId: userId },
        include: { product: true, seller: true },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Avaliações que o usuário recebeu (como vendedor)
      reviews = await prisma.review.findMany({
        where: { sellerId: userId },
        include: { product: true, buyer: true },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json(reviews);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar avaliações.' });
  }
}; 