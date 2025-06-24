import { Request, Response } from 'express';
import prisma from '../prisma';

// Listar todos os usuários
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
};

// Banir/desbanir usuário
export const banUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;
    const user = await prisma.user.update({ where: { id }, data: { isBanned } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao banir usuário.' });
  }
};

// Listar todos os produtos
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({ include: { seller: true, category: true, subcategory: true } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos.' });
  }
};

// Aprovar/remover anúncio
export const setProductActive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const product = await prisma.product.update({ where: { id }, data: { isActive } });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar anúncio.' });
  }
};

// Listar todos os pedidos
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({ include: { product: true, buyer: true, seller: true } });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
};

// Resolver disputa
export const resolveDispute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;
    const dispute = await prisma.dispute.update({ where: { id }, data: { status, resolution, resolvedAt: new Date() } });
    res.json(dispute);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao resolver disputa.' });
  }
}; 