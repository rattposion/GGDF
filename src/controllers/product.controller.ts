import { Request, Response } from 'express';
import prisma from '../prisma';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, price, images, categoryId, subcategoryId, type, stock, guarantee } = req.body;
    const sellerId = (req as any).userId;
    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: Number(price),
        images,
        categoryId,
        subcategoryId,
        type,
        sellerId,
        stock: stock ? Number(stock) : null,
        guarantee,
      },
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar produto.' });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { seller: true, category: true, subcategory: true }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos.' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { seller: true, category: true, subcategory: true }
    });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produto.' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sellerId = (req as any).userId;
    const data = req.body;
    const product = await prisma.product.update({
      where: { id, sellerId },
      data,
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sellerId = (req as any).userId;
    await prisma.product.delete({ where: { id, sellerId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar produto.' });
  }
}; 