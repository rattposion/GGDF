import { Request, Response } from 'express';
import prisma from '../prisma';

// Listar relatórios
export const getReports = async (req: Request, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      include: { user: { select: { username: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar relatórios.' });
  }
};

// Criar relatório
export const createReport = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, description, type, attachment } = req.body;
    const report = await prisma.report.create({
      data: { userId, title, description, type, attachment }
    });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar relatório.' });
  }
}; 