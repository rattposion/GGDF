import { Request, Response } from 'express';
import prisma from '../prisma';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, price, images, categoryId, subcategoryId, type, stock, guarantee } = req.body;
    const sellerId = (req as any).userId;
    const subcat = await prisma.subcategory.findUnique({ where: { id: subcategoryId } });
    if (!subcat) {
      return res.status(400).json({ error: 'Subcategoria inválida.' });
    }
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
    console.error('Erro ao criar produto:', err);
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
    console.log('[getProductById] ID recebido:', id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { seller: true, category: true, subcategory: true }
    });
    console.log('[getProductById] Produto encontrado:', product);
    if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
    res.json(product);
  } catch (err) {
    console.error('[getProductById] Erro:', err);
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

export const getProductQuestions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const questions = await prisma.question.findMany({
      where: { productId: id },
      include: { user: { select: { id: true, username: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar perguntas do produto.' });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: { buyer: { select: { id: true, username: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar avaliações do produto.' });
  }
};

export const createProductQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Pergunta não pode ser vazia.' });
    }
    const newQuestion = await prisma.question.create({
      data: {
        productId: id,
        userId,
        question,
      },
    });
    return res.status(201).json(newQuestion);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar pergunta.' });
  }
};

export const createProductReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { rating, comment } = req.body;
    if (!rating || !comment || !comment.trim()) {
      return res.status(400).json({ error: 'Avaliação e comentário são obrigatórios.' });
    }
    // Buscar o produto para pegar o sellerId
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
    const newReview = await prisma.review.create({
      data: {
        productId: id,
        buyerId: userId,
        sellerId: product.sellerId,
        rating: Number(rating),
        comment,
      },
    });
    return res.status(201).json(newReview);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar avaliação.' });
  }
}; 
