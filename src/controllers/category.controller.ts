import { Request, Response } from 'express';
import prisma from '../prisma';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({ include: { subcategories: true } });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar categorias.' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, icon, description } = req.body;
    const category = await prisma.category.create({
      data: { name, slug, icon, description },
    });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar categoria.' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const category = await prisma.category.update({ where: { id }, data });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar categoria.' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar categoria.' });
  }
};

export const createSubcategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, categoryId } = req.body;
    const subcategory = await prisma.subcategory.create({
      data: { name, slug, categoryId },
    });
    res.json(subcategory);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar subcategoria.' });
  }
};

export const updateSubcategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const subcategory = await prisma.subcategory.update({ where: { id }, data });
    res.json(subcategory);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar subcategoria.' });
  }
};

export const deleteSubcategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.subcategory.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar subcategoria.' });
  }
}; 