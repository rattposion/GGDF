import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({ include: { owner: { select: { id: true, name: true, email: true } } } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos.' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(id) }, include: { owner: { select: { id: true, name: true, email: true } } } });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produto.' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, ownerId } = req.body;
  if (!name || !description || !price || !ownerId) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }
  try {
    const product = await prisma.product.create({
      data: { name, description, price: Number(price), ownerId: Number(ownerId) },
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar produto.' });
  }
};

function getUserIdFromToken(req: Request): number | null {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.split(' ')[1];
  try {
    const payload = require('../utils/jwt').verifyToken(token) as any;
    return payload.userId;
  } catch {
    return null;
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = getUserIdFromToken(req);
  const { name, description, price } = req.body;
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
    if (product.ownerId !== userId) return res.status(403).json({ error: 'Acesso negado.' });
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, description, price: Number(price) },
    });
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = getUserIdFromToken(req);
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
    if (product.ownerId !== userId) return res.status(403).json({ error: 'Acesso negado.' });
    await prisma.product.delete({ where: { id: Number(id) } });
    res.json({ message: 'Produto deletado com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar produto.' });
  }
}; 