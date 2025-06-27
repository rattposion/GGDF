import { Request, Response } from 'express';
import prisma from '../prisma';

// Listar favoritos do usuário
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { product: { include: { category: true, subcategory: true } } }
    });
    res.json(favorites.map(f => ({ ...f.product, favoriteId: f.id })));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar favoritos.' });
  }
};

// Adicionar favorito
export const addFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { productId } = req.body;
    const favorite = await prisma.favorite.create({
      data: { userId, productId }
    });
    res.json(favorite);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar favorito.' });
  }
};

// Remover favorito
export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const favorite = await prisma.favorite.findUnique({ where: { id } });
    if (!favorite || favorite.userId !== userId) {
      return res.status(404).json({ error: 'Favorito não encontrado.' });
    }
    await prisma.favorite.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover favorito.' });
  }
}; 