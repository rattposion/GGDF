import { Request, Response } from 'express';
import prisma from '../prisma';

// Criar pedido (compra)
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { productId, variationId, subscriptionPlanId, amount, paymentMethod } = req.body;
    const buyerId = (req as any).userId;
    // Busca produto e valida estoque
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) return res.status(404).json({ error: 'Produto não encontrado.' });
    // Cria pedido
    const order = await prisma.order.create({
      data: {
        productId,
        buyerId,
        sellerId: product.sellerId,
        variationId,
        subscriptionPlanId,
        amount,
        status: 'pending',
        paymentMethod,
      },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar pedido.' });
  }
};

// Listar pedidos do usuário (comprador ou vendedor)
export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const role = req.query.role as 'buyer' | 'seller' | undefined;
    let where = {};
    if (role === 'buyer') where = { buyerId: userId };
    else if (role === 'seller') where = { sellerId: userId };
    else where = { OR: [{ buyerId: userId }, { sellerId: userId }] };
    const orders = await prisma.order.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
};

// Detalhe do pedido
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!order || (order.buyerId !== userId && order.sellerId !== userId)) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pedido.' });
  }
};

// Atualizar status/entrega do pedido
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { status, deliveryContent } = req.body;
    // Só vendedor pode entregar, só comprador pode marcar como recebido
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });
    if (status && status === 'delivered' && order.sellerId !== userId) {
      return res.status(403).json({ error: 'Apenas o vendedor pode marcar como entregue.' });
    }
    if (status && status === 'completed' && order.buyerId !== userId) {
      return res.status(403).json({ error: 'Apenas o comprador pode marcar como concluído.' });
    }
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: status || order.status,
        deliveryContent: deliveryContent || order.deliveryContent,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar pedido.' });
  }
}; 